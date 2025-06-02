import React from 'react';
import Image from 'next/image';
import styles from './PersonList.module.css';

// Individual list item component
const PersonListItem = ({ person }) => {
    return (
        <div className={styles.listItem}>
            {/* Profile Picture (Left) */}
            <div className={styles.profileImageContainer}>
                {person.image ? (
                    <Image src={person.image} alt={person.name} width={50} height={50} className={styles.profileImage} />
                ) : (
                    <div className={styles.placeholderImage}></div>
                )}
            </div>

            {/* Name (Center) */}
            <div className={styles.name}>{person.name}</div>

            {/* View Button (Right) */}
            <button className={styles.viewButton}>보기</button>
        </div>
    );
};

// List container component
const PersonList = ({ people }) => {
    return (
        <ul className={styles.listContainer}>
            {people.map((person, index) => (
                <li key={index}>
                    <PersonListItem person={person} />
                </li>
            ))}
        </ul>
    );
};

export default PersonList;