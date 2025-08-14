'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/clientApp';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import styles from './AdminPage.module.css';

export default function AdminPage({ onLogout }) { // 로그아웃 함수를 props로 받습니다.
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEntry, setNewEntry] = useState({});

    // 데이터 가져오기 로직
    useEffect(() => {
        const fetchData = async (collectionName) => {
            setLoading(true);
            setError(null);
            try {
                if (collectionName === 'chats') {
                    // ★★★ 채팅방 탭일 경우, 사용자 및 크리에이터 정보와 함께 가져옴 (수정된 부분) ★★★
                    const [chatsSnapshot, usersSnapshot, creatorsSnapshot] = await Promise.all([
                        getDocs(collection(db, 'chats')),
                        getDocs(collection(db, 'users')),
                        getDocs(collection(db, 'creators')) // creators 컬렉션 추가
                    ]);

                    const usersMap = new Map(usersSnapshot.docs.map(doc => [doc.id, doc.data()]));
                    const creatorsMap = new Map(creatorsSnapshot.docs.map(doc => [doc.id, doc.data()])); // creators 맵 생성

                    const fetchedData = chatsSnapshot.docs.map(chatDoc => {
                        const chatData = chatDoc.data();
                        const chatId = chatDoc.id;
                        const participantIds = chatId.split('_');
                        
                        // 참여자 ID로 사용자 및 크리에이터 정보 찾기
                        const userId = participantIds.find(id => usersMap.has(id));
                        const creatorId = participantIds.find(id => creatorsMap.has(id));

                        const user = usersMap.get(userId) || {};
                        const creator = creatorsMap.get(creatorId) || {};

                        return {
                            id: chatId,
                            ...chatData,
                            userName: user.name || '정보 없음',
                            userEmail: user.email || '정보 없음',
                            creatorName: creator.name || '정보 없음' // 크리에이터 이름 추가
                        };
                    });

                    // updatedAt 기준으로 최신순 정렬
                    fetchedData.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
                    setData(prev => ({ ...prev, [collectionName]: fetchedData }));

                } else {
                    // 다른 탭들은 기본 로직으로 데이터 로드
                    const querySnapshot = await getDocs(collection(db, collectionName));
                    const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    // --- 핸들러 함수들 (생성, 수정, 삭제) ---

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

    const handleEditClick = (id, field, currentValue) => { /* 이전과 동일 */ };
    const handleCancelEdit = () => { /* 이전과 동일 */ };
    const handleSaveEdit = async () => { /* 이전과 동일 */ };
    const handleAddClick = () => { /* 이전과 동일 */ };
    const handleNewEntryChange = (e) => { /* 이전과 동일 */ };
    const handleAddNewEntry = async (e) => { /* 이전과 동일 */ };


    // --- 테이블 및 폼 렌더링 ---
    const renderTable = (collectionName) => {
        const collectionData = data[collectionName] || [];

        if (loading) return <p>로딩 중...</p>;
        if (error) return <p className={styles.errorMessage}>{error}</p>;
        
        // 탭에 따라 보여줄 컬럼 목록(keys)을 동적으로 결정
        let keys = [];
        if (collectionData.length > 0) {
            keys = Object.keys(collectionData[0]).filter(key => key !== 'id');
            if (collectionName === 'chats') {
                // chats 탭에서는 lastMessage도 숨김
                keys = keys.filter(key => key !== 'lastMessage');
            }
            keys.sort();
        }
            
        const formatTimestamp = (ts) => (ts && ts.toDate ? ts.toDate().toLocaleString('ko-KR') : String(ts));
        const renderAddForm = () => ( <form> {/* ... */} </form> );

        return (
            <div className={styles.tableWrapper}>
                {/* ... 항목 추가 버튼 및 폼 ... */}
                {collectionData.length === 0 && !loading ? (
                    <p>표시할 데이터가 없습니다.</p>
                ) : (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                {/* chats 탭에서는 ID 컬럼 숨김 */}
                                {collectionName !== 'chats' && <th>ID</th>}
                                {keys.map(key => <th key={key}>{key}</th>)}
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collectionData.map(item => (
                                <tr key={item.id}>
                                    {/* chats 탭에서는 ID 셀 숨김 */}
                                    {collectionName !== 'chats' && <td title={item.id} className={styles.idCell}>{item.id}</td>}
                                    {keys.map(key => (
                                        <td key={key}>
                                            {/* 셀 내용 렌더링 (수정 모드 포함) */}
                                            <span>
                                                {key.toLowerCase().includes('at') ? formatTimestamp(item[key]) : String(item[key])}
                                            </span>
                                        </td>
                                    ))}
                                    <td className={styles.actionButtons}>
                                        {collectionName === 'chats' && (
                                            <button onClick={() => handleJoinChat(item.id)} className={styles.joinButton}>
                                                채팅 참여
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
              {/* 로그아웃 버튼 추가 */}
              <button onClick={onLogout} className={styles.logoutButton}>로그아웃</button>
            </div>
            <div className={styles.tabs}>
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