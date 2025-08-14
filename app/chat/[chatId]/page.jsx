"use client";

import { useState, useEffect, useRef } from 'react';
// 1. next/navigation에서 useParams를 import 합니다.
import { useParams } from 'next/navigation';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase/clientApp';
import styles from './ChatPage.module.css';

// 2. 컴포넌트의 인자에서 params를 제거합니다.
export default function ChatPage() {
    // 3. useParams 훅을 호출하여 params 객체를 가져옵니다.
    const params = useParams();
    const { chatId } = params; // chatId를 정상적으로 추출할 수 있습니다.

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // chatId가 변경될 때마다 Firestore에서 메시지를 실시간으로 가져옵니다.
    useEffect(() => {
        if (!chatId) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [chatId]);

    // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동합니다.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 메시지 전송 핸들러
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            text: newMessage,
            timestamp: serverTimestamp(),
            // 실제 앱에서는 현재 로그인한 사용자 정보를 저장해야 합니다.
            senderId: 'user1' 
        });

        setNewMessage('');
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messagesContainer}>
                {messages.map(msg => (
                    <div key={msg.id} className={`${styles.message} ${msg.senderId === 'user1' ? styles.sent : styles.received}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className={styles.inputForm}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className={styles.input}
                />
                <button type="submit" className={styles.sendButton}>전송</button>
            </form>
        </div>
    );
}