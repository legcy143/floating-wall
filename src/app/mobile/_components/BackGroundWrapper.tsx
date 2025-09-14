import React from 'react'
import Logo from "../../../../public/assets/logo.png";
import { Card, CardContent } from '@/components/ui/card';

export default function BackGroundWrapper({ children }: { children: React.ReactNode }) {
    return (
        <main
            className="w-screen max-h-[100vh] h-[100dvh] flex justify-center items-center"
            style={{
                backgroundImage: "url(./assets/bg.png)",
                backgroundOrigin: "center center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <section className="flex gap-5 w-full max-w-[30rem] flex-col items-center">
                <img src={Logo.src} alt="logo" className="w-44" />
                <Card className="w-[90%] max-w-[25rem] m-auto z-10">
                    <CardContent className="p-5 flex justify-center items-center flex-col space-y-3">
                        {children}
                    </CardContent>
                </Card>
            </section>
        </main>
    )
}
