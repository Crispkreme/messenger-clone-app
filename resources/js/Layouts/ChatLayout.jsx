import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import TextInput from '@/Components/TextInput';
import ConversationItem from '@/Components/App/ConversationItem';

const ChatLayout = ({ children }) => {

    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversations = page.props.selectedConversations;
    
    console.log('conversations: ', conversations);
    console.log('selected conversations: ', selectedConversations);

    const [ setOnlineUsers, isSetOnlineUsers ] = useState({});

    const isUserOnline = (userId) => setOnlineUsers[userId];

    // conversations
    const [ setLocalConversations, isSetLocalConversations ] = useState([]);
    const [ setSortedConversations, isSetSortedConversations ] = useState([]);

    const onSearch = (ev) => {
        const search = ev.target.value.tolowerCase();
        isSetLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.tolowerCase().includes(search);
            })
        );
    }

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
            <div className='flex-1 w-full flex overflow-hidden'>
                <div className={`
                    transition-all 
                    w-full 
                    sm:w-[220px] 
                    md:w-[300px] 
                    bg-slate-800 
                    flex 
                    flex-col 
                    overflow-hidden
                    ${ selectedConversations ? '-ml-[100%] sm:ml-0' : ''}
                `}>
                    <div className='flex items-center justify-between py-2 px-3 text-xl font-medium'>
                        My conversations

                        <div 
                            className='tooltip tooltip-left' 
                            data-tip="Create new Group"
                        >
                            <button className='text-gray-400 hover:text-gray-200'>
                                <PencilSquareIcon className='w-4 h-4 inline-block ml-2' />
                            </button>
                        </div>
                    </div>
                    <div className='p-3'>
                        <TextInput 
                            onKeyup={onSearch}
                            placeholder='Filter users and groups'
                            className='w-full'
                        />
                    </div>
                    <div className='flex-1 overflow-auto'>
                        {
                            setSortedConversations && setSortedConversations.map((conversation) => (
                                <ConversationItem
                                    key={`${
                                        conversations.is_group
                                        ? ' group_'
                                        : 'user_'
                                    }${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    selectedConversation={selectedConversations}
                                />
                            ))
                        }
                    </div>
                </div>
                <div className='flex-1 flex flex-col overflow-hidden'>
                    { children }
                </div>
            </div>
        </>
    )
}

export default ChatLayout