"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "../../../public/assets/logo.png";
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
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import io from "socket.io-client";
import { TiArrowSortedDown } from "react-icons/ti";
import feedbackOptions from "@/utils/feedbackOptions";
import axios from "axios";
import { API_URL } from "@/constant/API_URL";
import Camera from "./_components/Camera";

const socket = io(API_URL, {
  transports: ["websocket"],
});

interface FormDataTypes {
  name: string;
  feedback: string;
  userImage: string;
}

const initialData: FormDataTypes = {
  name: "",
  feedback: feedbackOptions[0],
  // userImage: "https://cdn-images.quenth.com/c5c9b77f-260e-481a-9906-80bfd29af005_Women-2.png",
  userImage: "",
};

export default function Mobile() {
  const [formData, setFormData] = useState<FormDataTypes>({ ...initialData });

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
    if (formData.name.length === 0 || formData.feedback.length === 0) {
      toast.warning("All fields are required");
      return;
    }

    socket.emit("wall", formData);
    await axios.post(
      `${API_URL}/floating-wall`,
      formData
    );
    toast.success("Feedback shared successfully");
    setFormData({ ...initialData });
  };

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
      <Card className="w-[90%] max-w-[25rem] m-auto z-10">
        <CardContent className="p-3 flex justify-center items-center flex-col space-y-3">
          <img src={Logo.src} alt="logo" className="w-44" />

          {/* content goes here */}
          {
            formData.userImage ? (
              <>
                <section className="flex flex-col gap-3">
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
                  <span className="text-xs text-end w-full block ml-0 mt-[-0.7rem]">
                    {formData.name.length}/{maxLength.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <Label className=" w-20">I'm Feeling </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className=" flex-1 justify-between">
                          {formData.feedback}
                          <TiArrowSortedDown className="ml-3" />
                        </Button>
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
                <CardFooter className="flex flex-row items-center justify-center gap-2 py-2 pt-7">
                  <Button
                    className="px-14 gap-2 text-white bg-[#3f0653]"
                    onClick={handleSubmit}
                  >
                    Share
                  </Button>
                </CardFooter>
              </>
            ) : (
              <Camera image={formData.userImage} setImage={(image) => setFormData({ ...formData, userImage: image as string})} />
            )
          }
        </CardContent>
      </Card>
    </main>
  );
}
