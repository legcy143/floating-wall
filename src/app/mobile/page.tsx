"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import io from "socket.io-client";

const socket = io("https://mosaic-api.gokapturehub.com", {
  transports: ["websocket"],
});

interface FormDataTypes {
  name: string;
  feedback: string;
}

export default function Mobile() {
  const [feedbackOption, setFeedbackOption] = useState('Select');
  const [formData, setFormData] = useState<FormDataTypes>({
    name: "",
    feedback: "",
  });
  let maxLength = {
    name: 10,
  }

  function handleOnChange(key: string, value: string) {
    if (value.length > maxLength.name && key == "name") {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(()=>{
    setFormData({...formData, feedback:feedbackOption});
    console.log(formData);
  },[feedbackOption]);
  useEffect(()=>{
    console.log(formData);
  },[formData]);


  const handleSubmit = async () => {

    console.log(formData);
    if (formData.name.length === 0 && formData.feedback.length === 0) {
      toast.warning("All fields are required");
      return;
    }

    socket.emit("wall", formData);
    toast.success("form submited");
    setFormData({
      name: "",
      feedback: "",
    });
  };
  return (
    <main className="w-screen h-screen flex relative">
      <img
        src="./assets/bg.png"
        alt=""
        className="fixed top-0 right-0 w-screen h-screen z-[-1] object-cover"
      />
      <Card className="w-[90%] max-w-[25rem] m-auto z-10">
        <CardContent className="">
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          {/* content goes here */}
          <section className="space-y-2 p-1 py-2 overflow-auto">
            <div>
              <Label>
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="name"
                value={formData.name}
                onChange={(e) => handleOnChange("name", e.target.value)}
              />
              <span className="text-xs text-end w-full block m-1 ml-0">{formData.name.length}/{maxLength.name}</span>
            </div>
            {/* <div>
              <Label>
                Feedback <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Feedback . . ."
                value={formData.feedback}
                onChange={(e) => handleOnChange("feedback", e.target.value)}
              />
                <span className="text-xs text-end w-full block m-1 ml-0">{formData.feedback.length}/{maxLength.feedback}</span>
            </div> */}
            <div className="flex gap-x-2 items-center">
              <p>I'm Feeling </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{feedbackOption}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 h-full">
                  <DropdownMenuLabel>I am Feeling</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup defaultValue={feedbackOption} onValueChange={setFeedbackOption}>
                    <DropdownMenuRadioItem value="Excited">Excited</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Top of the World">Top of the World</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Inspired">Inspired</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="WOWed">WOWed</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Colorful">Colorful</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Vibrant">Vibrant</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Bold">Bold</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Brave">Brave</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Dynamic">Dynamic</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Thrilled">Thrilled</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Energetic">Energetic</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Radiant">Radiant</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Lively">Lively</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section>
          {/* content goes here */}
          <CardFooter className="flex flex-row items-center justify-end gap-2 py-2">
            <Button onClick={handleSubmit}>Send feedback</Button>
          </CardFooter>
        </CardContent>
      </Card>
    </main>
  );
}
