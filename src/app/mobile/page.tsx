"use client";
import React, { useState } from "react";
import { toast } from "sonner";

import io from "socket.io-client";
import { TiArrowSortedDown } from "react-icons/ti";
import feedbackOptions from "@/utils/feedbackOptions";
import axios from "axios";
import { API_URL } from "@/constant/API_URL";
import Camera from "./_components/Camera";
import BackGroundWrapper from "./_components/BackGroundWrapper";
import Form from "./_components/Form";
import { MdDone, MdDoneAll } from "react-icons/md";

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
  const [isSubmited, setisSubmited] = useState(false)

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
    setisSubmited(true)
  };

  if (isSubmited) {
    return (
      <BackGroundWrapper>
        <section className="flex flex-col gap-5  py-5 items-center justify-center">
          <div className="bg-pink-400 p-5 rounded-full text-white">
            <MdDoneAll size={25} />
          </div>
          <p className="font-bold text-xl">Thank you, {formData.name}!</p>
          <p className="text-center p-1">Your lantern has been lit on the big screen.</p>
        </section>
      </BackGroundWrapper>
    )
  }

  if (!formData.userImage) {
    return (
      <BackGroundWrapper>
        <p className="text-center">Light Your Lamp – Upload Your Photo</p>
        <Camera image={formData.userImage} setImage={(image) => handleOnChange("userImage", image as string)} />
      </BackGroundWrapper>
    );
  }

  return (
    <BackGroundWrapper>
      <Form formData={formData} handleOnChange={handleOnChange} handleSubmit={handleSubmit} maxLength={maxLength} />
    </BackGroundWrapper>
  )
}
