'use client'

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/user/context';
import { Chat } from '@/lib/types/chat';
import { User } from '@/lib/types/user';
import { TypographyH3, TypographyP } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export const ChatsPage = () => {
  const { user } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [peers, setPeers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('token') || '{}');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/chat/chats`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
              'Authorization': `Bearer ${token.access_token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        } else {
          console.log('Error fetching chats');
        }
      } catch (error) {
        console.log('An error occurred');
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    const fetchPeers = async () => {
      const token = JSON.parse(localStorage.getItem('token') || '{}');
      const peerIds = chats.map(chat =>
        user?.role === 'Buyer' ? chat.farmer_id : chat.buyer_id
      );
      const uniquePeerIds = Array.from(new Set(peerIds));

      const peerPromises = uniquePeerIds.map(async (id) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND}/auth/users/${id}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'Authorization': `Bearer ${token.access_token}`,
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            return { id, data };
          } else {
            return null;
          }
        } catch (error) {
          console.log('An error occurred fetching peer', id);
          console.log(error);
          return null;
        }
      });

      const results = await Promise.all(peerPromises);

      const peersData: { [key: string]: User } = {};
      results.forEach(result => {
        if (result) {
          peersData[result.id] = result.data;
        }
      });

      setPeers(peersData);
    };

    if (chats.length > 0) {
      fetchPeers();
    }
  }, [chats, user]);

  if (loading) {
    return (
      <main className="p-4">
        <TypographyH3>Your Chats</TypographyH3>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="my-4">
            <Skeleton className="h-6 w-3/4" />
          </div>
        ))}
      </main>
    );
  }

  return (
    <main className="p-4">
      <TypographyH3>Your Chats</TypographyH3>
      {chats.length === 0 ? (
        <TypographyP>No chats available.</TypographyP>
      ) : (
        chats.map((chat) => {
          const peerId =
            user?.role === 'Buyer' ? chat.farmer_id : chat.buyer_id;
          const peer = peers[peerId];
          return (
            <Link key={chat.id} href={`/chats/${chat.id}`}>
              <div className="border-b py-2">
                <TypographyP>{`Chat with ${
                  peer ? peer.fullname : '...'
                }`}</TypographyP>
              </div>
            </Link>
          );
        })
      )}
    </main>
  );
};
