'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/clientApp';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import styles from './AdminPage.module.css';

export default function AdminPage({ onLogout }) {
    const [activeTab, setActiveTab] = useState('contacts');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 데이터 가져오기 로직
    useEffect(() => {
        const fetchData = async (collectionName) => {
            setLoading(true);
            setError(null);
            try {
                if (collectionName === 'chats') {
                    // 채팅방 탭일 경우, 사용자 및 크리에이터 정보와 함께 가져옴
                    const [chatsSnapshot, usersSnapshot, creatorsSnapshot] = await Promise.all([
                        getDocs(collection(db, 'chats')),
                        getDocs(collection(db, 'users')),
                        getDocs(collection(db, 'creators'))
                    ]);

                    const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));
                    const creatorsMap = new Map(creatorsSnapshot.docs.map(doc => [doc.id, doc.data()]));

                    const fetchedData = chatsSnapshot.docs.map(chatDoc => {
                        const chatData = chatDoc.data();
                        const chatId = chatDoc.id;
                        const participantIds = chatId.split('_');
                        
                        const userId = participantIds.find(id => usersMap.has(id));
                        const creatorId = participantIds.find(id => creatorsMap.has(id));

                        const user = usersMap.get(userId) || {};
                        const creator = creatorsMap.get(creatorId) || {};

                        return {
                            id: chatId,
                            ...chatData,
                            userName: user.name || '정보 없음',
                            userEmail: user.email || '정보 없음',
                            creatorName: creator.name || '정보 없음'
                        };
                    });

                    fetchedData.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
                    setData(prev => ({ ...prev, [collectionName]: fetchedData }));

                } else {
                    // 다른 탭들은 기본 로직으로 데이터 로드
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    let fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                    // 문의, 전화기록 탭일 경우 createdAt으로 정렬 (최신순)
                    if (collectionName === 'contacts' || collectionName === 'calls' || collectionName === 'users' || collectionName === 'creators') {
                        fetchedData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                    }

                    setData(prev => ({ ...prev, [collectionName]: fetchedData }));
                }
            } catch (err) {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(`'${collectionName}' 컬렉션 데이터를 불러오는 중 오류가 발생했습니다.`);
            } finally {
                setLoading(false);
            }
        };

        fetchData(activeTab);
    }, [activeTab]);

    // --- 핸들러 함수들 ---

    const handleDelete = async (collectionName, id) => {
        if (!window.confirm(`정말 ID: ${id} 문서를 삭제하시겠습니까?`)) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, collectionName, id));
            setData(prev => ({
                ...prev,
                [collectionName]: prev[collectionName].filter(item => item.id !== id)
            }));
            alert('삭제되었습니다.');
        } catch (error) {
            setError("삭제 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleJoinChat = (chatId) => {
        const url = `/chat/${chatId}?isAdmin=true`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShowContactDetails = (contact) => {
        const details = 
            `[문의 상세 내용]\n\n` +
            `ID: ${contact.id}\n` +
            `접수 시간: ${contact.createdAt?.toDate().toLocaleString('ko-KR') || 'N/A'}\n` +
            `구분: ${contact.type}\n` +
            `이름: ${contact.name}\n` +
            `연락처: ${contact.phone}\n` +
            `이메일: ${contact.email}\n` +
            `업체명: ${contact.company || 'N/A'}\n` +
            `SNS: ${contact.sns || 'N/A'}\n\n` +
            `--- 문의 내용 ---\n${contact.message}`;
        alert(details);
    };


    // --- 테이블 및 폼 렌더링 ---
    const renderTable = (collectionName) => {
        const collectionData = data[collectionName] || [];

        if (loading) return <p>로딩 중...</p>;
        if (error) return <p className={styles.errorMessage}>{error}</p>;
        
        let keys = [];
        if (collectionData.length > 0) {
            keys = Object.keys(collectionData[0]).filter(key => key !== 'id');
            if (collectionName === 'chats') {
                keys = keys.filter(key => key !== 'lastMessage');
            }
            if (collectionName === 'contacts') {
                keys = keys.filter(key => key !== 'message');
            }
            keys.sort();
        }
            
        // YYYYMMDDHHmm 포맷으로 변경하는 함수
        const formatCustomTimestamp = (ts) => {
            if (!ts || !ts.toDate) return 'N/A';
            const date = ts.toDate();
            const YYYY = date.getFullYear();
            const MM = String(date.getMonth() + 1).padStart(2, '0');
            const DD = String(date.getDate()).padStart(2, '0');
            const HH = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${YYYY}${MM}${DD}${HH}${mm}`;
        };

        return (
            <div className={styles.tableWrapper}>
                {collectionData.length === 0 && !loading ? (
                    <p>표시할 데이터가 없습니다.</p>
                ) : (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>NO</th>
                                {keys.map(key => <th key={key}>{key}</th>)}
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collectionData.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{collectionData.length - index}</td>
                                    {keys.map(key => (
                                        <td key={key}>
                                            <span>
                                                {key === 'createdAt' ? formatCustomTimestamp(item[key]) : String(item[key])}
                                            </span>
                                        </td>
                                    ))}
                                    <td className={styles.actionButtons}>
                                        {collectionName === 'chats' && (
                                            <button onClick={() => handleJoinChat(item.id)} className={styles.joinButton}>
                                                채팅 참여
                                            </button>
                                        )}
                                        {collectionName === 'contacts' && (
                                            <button onClick={() => handleShowContactDetails(item)} className={styles.joinButton}>
                                                상세 보기
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(collectionName, item.id)} className={styles.deleteButton}>
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        );
    };

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>관리자 페이지</h1>
                <button onClick={onLogout} className={styles.logoutButton}>로그아웃</button>
            </div>
            <div className={styles.tabs}>
                <button className={`${styles.tabButton} ${activeTab === 'contacts' ? styles.active : ''}`} onClick={() => setActiveTab('contacts')}>문의 관리</button>
                <button className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`} onClick={() => setActiveTab('users')}>고객 관리</button>
                <button className={`${styles.tabButton} ${activeTab === 'creators' ? styles.active : ''}`} onClick={() => setActiveTab('creators')}>크리에이터 관리</button>
                <button className={`${styles.tabButton} ${activeTab === 'calls' ? styles.active : ''}`} onClick={() => setActiveTab('calls')}>전화기록 관리</button>
                <button className={`${styles.tabButton} ${activeTab === 'chats' ? styles.active : ''}`} onClick={() => setActiveTab('chats')}>채팅방 관리</button>
            </div>
            <div className={styles.tabContent}>
                {renderTable(activeTab)}
            </div>
        </div>
    );
}