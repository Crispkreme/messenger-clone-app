import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';

const ChatLayout = ({ children }) => {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations;
    
    console.log('conversations: ', conversations);
    console.log('selected conversations: ', selectedConversations);

    const [ setOnlineUsers, isSetOnlineUsers ] = useState({});
    const isUserOnline = (userId) => onlineUsers[userId];

    // conversations
    const [ setLocalConversations, isSetLocalConversations ] = useState([]);
    const [ setSortedConversations, isSetSortedConversations ] = useState([]);

    useEffect(() => {
        window.Echo.join('chat-room')
            .here((users) => {
                console.log('here', users);

                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                isSetOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUsersObj };
                });
            })
            .joining((user) => {
                console.log('joining', user);

                isSetOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                });
            })
            .leaving((user) => {
                console.log('leaving', user);

                isSetOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
            })
            .error((error) => {
                console.log('error', error);
            });

        return () => {
            window.Echo.leave('online');
        }
    }, []);

    // check if conversation is change
    useEffect(() => {
        isSetLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        isSetSortedConversations(
            setLocalConversations.sort((a, b) => {
                if(a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                }else if(a.blocked_at) {
                    return 1;
                }else if(b.blocked_at){
                    return -1;
                }

                if(a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    )
                } else if(a.last_message_date) {
                    return -1;
                } else if(b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            }),
        );
    }, [setLocalConversations]);
    
    return (
        <>
            ChatLayout
            <div>{ children }</div>
        </>
    )
}

export default ChatLayout