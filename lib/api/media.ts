import api from "@/lib/axios";

export const uploadMedia = async (file: File, folder: string): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
  
    const res = await api.post("/media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "text",                 // <- nhận thuần text
      transformResponse: [(d) => d],        // <- đừng parse JSON
    });
  
    // Nếu axios của bạn trả về response đầy đủ: dùng res.data
    // Nếu axios interceptor đã return body luôn: res CHÍNH LÀ string
    const maybe = (res as any)?.data ?? res;
    const url =
      typeof maybe === "string"
        ? maybe.trim()
        : (maybe?.data ?? maybe?.url ?? "").toString().trim();
  
    if (!url) throw new Error("Upload failed: empty URL");
    return url;
  };
