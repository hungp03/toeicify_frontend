"use client";

import { useEffect } from "react";
import { listenForMessages } from "@/lib/fcm";

export default function FcmListener() {
  useEffect(() => {
    listenForMessages();
  }, []);

  return null;
}
