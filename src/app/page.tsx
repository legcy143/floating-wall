"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="flex flex-col gap-2 h-screen">
      <Card className="m-auto w-full max-w-[40rem]"> 
        <CardContent className="flex flex-col gap-5">
          <CardHeader>
            <CardTitle>
              Links
            </CardTitle>
          </CardHeader>
          <Button onClick={()=>{router.push("/mobile")}} className="text-xl p-10">Mobile link</Button>
          <Button onClick={()=>{router.push("/floating1")}}  className="text-xl p-10">Wall link</Button>
        </CardContent>
      </Card>
    </main>
  );
}
