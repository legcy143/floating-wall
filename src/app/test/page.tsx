"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/constant/API_URL';
import feedbackOptions from '@/utils/feedbackOptions';
import { Label } from '@radix-ui/react-label';
import axios from 'axios';
import React, { useState } from 'react'
import { MdWarning } from 'react-icons/md';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const formData = {
    name: "testing",
    feedback: feedbackOptions[0],
    userImage: "https://cdn-images.quenth.com/c5c9b77f-260e-481a-9906-80bfd29af005_Women-2.png",
};

const socket = io(API_URL, {
    transports: ["websocket"],
});


export default function Page() {
    const [currentCount, setCurrentCount] = useState(0)
    const [total, setTotal] = useState<number>(0)
    const [isLoading, setisLoading] = useState(false)

    const submit = async () => {
        socket.emit("wall", formData);
        await axios.post(
            `${API_URL}/floating-wall`,
            formData
        );
    }

    const handleSubmit = async () => {
        try {
            setisLoading(true);
            if (formData.name.length === 0 || formData.feedback.length === 0) {
                return;
            }
            for (let i = 0; i < total; i++) {
                await submit();
                setCurrentCount((prev) => prev + 1)
            }
            toast.success("All data submitted successfully");

        } catch (error) {
            toast.error("Something went wrong. check console for more error");
            console.log("error : ", error);
        } finally {
            setisLoading(false);
        }
    };

    const handleClearAllData = async () => {
        try {
            let res = confirm("Are you sure you want to clear all data? This action cannot be undone.");
            if (!res) return;
            setisLoading(true);
            await axios.get(
                `${API_URL}/floating-wall/delete`
            );
            toast.success("All data cleared successfully");
        } catch (error) {
            toast.error("Something went wrong. check console for more error");
            console.log("error : ", error);
        } finally {
            setisLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-4 p-4 max-w-xs m-auto pt-[5rem]'>
            <p className='text-center font-bold text-2xl my-5'>TEST</p>
            <Input
                type="text"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
            />
            <Label>Total send data count : {currentCount}</Label>
            <Button disabled={isLoading || currentCount === total} onClick={handleSubmit}>
                {
                    isLoading ? `Submitting ${currentCount} / ${total}` : `Submit ${total} data`
                }
            </Button>

            <Button onClick={handleClearAllData} variant={"destructive"} size={'lg'} disabled={isLoading} className='text-xl'><MdWarning color='white' /> Clear All Data</Button>
        </div>
    )
}
