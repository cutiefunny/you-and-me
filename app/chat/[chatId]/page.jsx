"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image'; // 1. Next.js의 Image 컴포넌트를 import 합니다.
import { useParams, useSearchParams } from 'next/navigation'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase/clientApp';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './ChatPage.module.css';

export default function ChatPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { chatId } = params;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [senderId, setSenderId] = useState(null);
    const messagesEndRef = useRef(null);

    // senderId 결정 로직 (이전과 동일)
    useEffect(() => {
        const isAdmin = searchParams.get('isAdmin') === 'true';
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (isAdmin) {
                setSenderId('manager');
            } else if (user) {
                setSenderId(user.uid);
            } else {
                setSenderId(null);
            }
        });
        return () => unsubscribe();
    }, [searchParams]);

    // 메시지 로드 및 스크롤 로직 (이전과 동일)
    useEffect(() => {
        if (!chatId) return;
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    // 메시지 전송 로직 (이전과 동일)
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!senderId || newMessage.trim() === '') return;

        const chatDocRef = doc(db, 'chats', chatId);
        const messagesRef = collection(chatDocRef, 'messages');

        const messageData = {
            text: newMessage,
            timestamp: serverTimestamp(),
            senderId: senderId,
            isAdmin: senderId === 'manager'
        };

        await addDoc(messagesRef, messageData);
        await setDoc(chatDocRef, {
            lastMessage: newMessage,
            updatedAt: serverTimestamp()
        }, { merge: true });

        setNewMessage('');
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
                {messages.map(msg => {
                    // 2. 현재 보는 사람이 보낸 메시지인지(isSent) 확인합니다.
                    const isSentByMe = msg.senderId === senderId;

                    return (
                        // 3. 메시지 한 줄을 감싸는 컨테이너를 추가하고, 보낸 사람에 따라 스타일을 지정합니다.
                        <div key={msg.id} className={`${styles.messageRow} ${isSentByMe ? styles.sentRow : styles.receivedRow}`}>
                            
                            {/* 4. 내가 받음 메시지일 경우에만 프로필 이미지를 표시합니다. */}
                            {!isSentByMe && (
                                <Image
                                    // 관리자 메시지이면 manager 프로필, 아니면 기본 사용자 프로필을 보여줍니다.
                                    src={msg.isAdmin ? '/images/manager-profile.jpg' : '/images/default-user.jpg'}
                                    alt="Profile"
                                    width={40}
                                    height={40}
                                    className={styles.profileImage}
                                />
                            )}
                            
                            {/* 5. 메시지 말풍선 */}
                            <div className={`${styles.message} ${isSentByMe ? styles.sent : styles.received}`}>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className={styles.input}
                    disabled={!senderId} 
                />
                <button type="submit" className={styles.sendButton} disabled={!senderId}>
                    전송
                </button>
            </form>
        </div>
    );
}