// app/admin/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/clientApp';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore'; // addDoc 추가
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'creators', 'calls'
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(null); // { collection: 'users', id: 'docId', field: 'name', originalValue: 'oldVal' }
  const [editValue, setEditValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false); // 추가 폼 표시 여부
  const [newEntry, setNewEntry] = useState({}); // 새 항목 데이터

  const fetchData = async (collectionName) => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(prev => ({ ...prev, [collectionName]: fetchedData }));
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(`데이터를 불러오는 중 오류가 발생했습니다: ${collectionName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData('users');
    fetchData('creators');
    fetchData('calls');
  }, []);

  const handleDelete = async (collectionName, id) => {
    if (window.confirm(`정말 ${id} 문서를 삭제하시겠습니까?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, collectionName, id));
        setData(prev => ({
          ...prev,
          [collectionName]: prev[collectionName].filter(item => item.id !== id)
        }));
        alert('삭제되었습니다.');
      } catch (err) {
        console.error(`Error deleting ${collectionName} ${id}:`, err);
        setError('삭제 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditClick = (collectionName, id, field, currentValue) => {
    setEditMode({ collection: collectionName, id, field, originalValue: currentValue });
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editMode) return;

    const { collection: collectionName, id, field } = editMode;
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { [field]: editValue });

      setData(prev => ({
        ...prev,
        [collectionName]: prev[collectionName].map(item =>
          item.id === id ? { ...item, [field]: editValue } : item
        )
      }));
      setEditMode(null);
      setEditValue('');
      alert('수정되었습니다.');
    } catch (err) {
      console.error(`Error updating ${collectionName} ${id} field ${field}:`, err);
      setError('수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditValue('');
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setNewEntry({}); // 폼 초기화
  };

  const handleNewEntryChange = (field, value) => {
    setNewEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewEntry = async () => {
    setLoading(true);
    setError(null);
    try {
      if (Object.keys(newEntry).length === 0) {
        alert("추가할 데이터를 입력해주세요.");
        return;
      }
      
      await addDoc(collection(db, activeTab), newEntry);
      setShowAddForm(false);
      setNewEntry({});
      await fetchData(activeTab); // 데이터 다시 불러오기
      alert('새 항목이 추가되었습니다.');
    } catch (err) {
      console.error(`Error adding new entry to ${activeTab}:`, err);
      setError('항목 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (collectionName) => {
    const collectionData = data[collectionName] || [];
    const isDataLoaded = data[collectionName] !== undefined;

    if (loading && !isDataLoaded) return <p>로딩 중...</p>;
    if (error) return <p className={styles.errorMessage}>{error}</p>;
    if (collectionData.length === 0 && !loading) return <p>데이터가 없습니다.</p>;

    // Dynamically get all unique keys from the data to form table headers
    const allKeys = new Set();
    collectionData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    const keys = Array.from(allKeys).filter(key => key !== 'id').sort(); // 'id'는 항상 첫 번째 열에

    return (
      <div className={styles.tableWrapper}>
        <button className={styles.addButton} onClick={handleAddClick}>항목 추가</button>

        {showAddForm && (
          <div className={styles.addForm}>
            <h3 className={styles.addFormTitle}>{activeTab} 항목 추가</h3>
            {/* 동적으로 입력 필드 생성 */}
            <div className={styles.inputGroup}>
                {keys.map(key => (
                    <input
                        key={`new-${key}`}
                        type="text"
                        placeholder={key}
                        value={newEntry[key] || ''}
                        onChange={(e) => handleNewEntryChange(key, e.target.value)}
                        className={styles.addInputField}
                    />
                ))}
            </div>
            <div className={styles.formActions}>
                <button onClick={handleAddNewEntry} className={styles.addSaveButton}>저장</button>
                <button onClick={() => setShowAddForm(false)} className={styles.addCancelButton}>취소</button>
            </div>
          </div>
        )}

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              {keys.map(key => <th key={key}>{key}</th>)}
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {collectionData.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                {keys.map(key => (
                  <td key={key}>
                    {editMode?.collection === collectionName && editMode?.id === item.id && editMode?.field === key ? (
                      <div className={styles.editControls}>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className={styles.editInput}
                        />
                        <div className={styles.editActions}>
                          <button onClick={handleSaveEdit} className={styles.addSaveButton}>저장</button>
                          <button onClick={handleCancelEdit} className={styles.addCancelButton}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <span onClick={() => handleEditClick(collectionName, item.id, key, item[key])}>
                        {/* 객체나 배열은 JSON.stringify로 표시, 아니면 직접 표시 */}
                        {typeof item[key] === 'object' && item[key] !== null
                          ? JSON.stringify(item[key])
                          : String(item[key])}
                      </span>
                    )}
                  </td>
                ))}
                <td>
                  <button onClick={() => handleDelete(collectionName, item.id)} className={styles.deleteButton}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.title}>관리자 페이지</h1>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          고객관리
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'creators' ? styles.active : ''}`}
          onClick={() => setActiveTab('creators')}
        >
          크리에이터 관리
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'calls' ? styles.active : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          전화기록 관리
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'users' && (
          <div>
            {renderTable('users')}
          </div>
        )}
        {activeTab === 'creators' && (
          <div>
            {renderTable('creators')}
          </div>
        )}
        {activeTab === 'calls' && (
          <div>
            {renderTable('calls')}
          </div>
        )}
      </div>
    </div>
  );
}