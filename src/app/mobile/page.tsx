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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { IoIosSend } from "react-icons/io";

import io from "socket.io-client";
import { TiArrowSortedDown } from "react-icons/ti";

const socket = io("https://mosaic-api.gokapturehub.com", {
  transports: ["websocket"],
});

interface FormDataTypes {
  name: string;
  feedback: string;
}

const feedbackOptions = [
  "Excited",
  "Top of the World",
  "Inspired",
  "WOWed",
  "Colorful",
  "Vibrant",
  "Bold",
  "Brave",
  "Dynamic",
  "Thrilled",
  "New",
  "Energetic",
  "Radiant",
  "Lively",
];

export default function Mobile() {
  const [formData, setFormData] = useState<FormDataTypes>({
    name: "",
    feedback: feedbackOptions[0],
  });
  let maxLength = {
    name: 10,
  };

  function handleOnChange(key: string, value: string) {
    if (value.length > maxLength.name && key == "name") {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

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
      feedback: feedbackOptions[0],
    });
  };
  return (
    <main className="w-screen max-h-[100vh] h-[100dvh] flex relative"
    style={{
      backgroundImage: "url(./assets/bg.png)",
      backgroundOrigin: "center center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center", 
    }}>
      <Card className="w-[90%] max-w-[25rem] m-auto z-10">
        <CardContent className="">
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          {/* content goes here */}
          {/* <section className="space-y-2 p-1 py-2 overflow-auto">
            <div>
              <div className="flex items-center">
              <Label className="w-32 bg-green--500">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="name"
                value={formData.name}
                onChange={(e) => handleOnChange("name", e.target.value)}
              />
              </div>
              <span className="text-xs text-end w-full block m-1 ml-0">
                {formData.name.length}/{maxLength.name}
              </span>
            </div>

            <div className="flex gap-x-2 items-center bg-red-500">
              <p className="w-32 bg-green-300">I'm Feeling </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{formData.feedback}<TiArrowSortedDown className="ml-3"/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full h-full">
                  <DropdownMenuLabel>I am Feeling</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    className="p-2 max-h-[40vh] overflow-y-auto md:scroll-m-10"
                    defaultValue={formData.feedback}
                    onValueChange={(e) => {
                      handleOnChange("feedback", e);
                      console.log(e);
                    }}
                  >
                    {feedbackOptions?.map((e) => (
                      <DropdownMenuRadioItem key={e} value={e}>
                        {e}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </section> */}

          {/* new update */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label className="w-20">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
              className="flex-1"
                placeholder=". . ."
                value={formData.name}
                onChange={(e) => handleOnChange("name", e.target.value)}
                />
                </div>
              <span className="text-xs text-end w-full block ml-0 mt-[-0.5rem]">
                {formData.name.length}/{maxLength.name}
              </span>

              <div className="flex items-center gap-2">
              <Label className=" w-20">I'm Feeling </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className=" flex-1 justify-between">{formData.feedback}<TiArrowSortedDown className="ml-3"/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full h-full flex-1">
                  <DropdownMenuLabel>I am Feeling</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    className="p-2 max-h-[35vh] overflow-y-auto"
                    defaultValue={formData.feedback}
                    onValueChange={(e) => {
                      handleOnChange("feedback", e);
                      console.log(e);
                    }}
                  >
                    {feedbackOptions?.map((e) => (
                      <DropdownMenuRadioItem key={e} value={e}>
                        {e}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
                    </div>
          </section>
          {/* content goes here */}
          <CardFooter className="flex flex-row items-center justify-center gap-2 py-2 pt-7">
            <Button className="px-14 gap-2 text-white bg-[--event-theme]"  onClick={handleSubmit}>Share</Button>
          </CardFooter>
        </CardContent>
      </Card>
    </main>
  );
}
