import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../styles/user.module.css'; // Import the updated CSS module

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const student_id = localStorage.getItem("student_id"); // Get student ID from localStorage

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!student_id) {
                console.error('Student ID not found in localStorage.');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/notifications', {
                    params: { student_id } // Pass student_id as a query parameter
                });
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [student_id]); // Re-fetch if student_id changes

    return (
        <div className={styles.notificationsContainer}>
            <h2 className={styles.notificationsHeading}>Notifications</h2>
            {notifications.length === 0 ? (
                <p>No notifications available.</p>
            ) : (
                <ul className={styles.notificationsList}>
                    {notifications.map((notification) => (
                        <li key={notification.id} className={styles.notificationsListItem}>
                            <p className={styles.notificationsMessage}>
                                <strong>Message:</strong> {notification.message}
                            </p>
                            {notification.link && (
                                <p className={styles.notificationsLink}>
                                    <strong>Link:</strong>{' '}
                                    <a href={notification.link} target="_blank" rel="noopener noreferrer">
                                        {notification.link}
                                    </a>
                                </p>
                            )}
                            {notification.file_path && (
                                <p className={styles.notificationsFile}>
                                    <strong>File:</strong>{' '}
                                    <a
                                        href={notification.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {notification.file_type === 'image' ? 'View Image' : 'Download File'}
                                    </a>
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;
