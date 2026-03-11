import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ isSuccess: false, message: "Dosya bulunamadı." }, { status: 400 });
        }

        // Backend URL from environment variables or default to localhost:7112
        const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7112";

        // Forward the exact same FormData to the .NET Backend API
        const response = await fetch(`${backendUrl}/api/Upload`, {
            method: 'POST',
            body: formData,
            // We might need to forward authorization headers here if frontend route is protected
            // headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { isSuccess: false, message: data.message || "Backend'e yükleme sırasında hata oluştu." },
                { status: response.status }
            );
        }

        // The .NET Backend returns a relative URL like /images/products/...
        // We resolve it to act as absolute URL using the backend URL
        const backendImageUrl = `${backendUrl}${data.data?.url || data.url}`;

        return NextResponse.json({ isSuccess: true, url: backendImageUrl });
    } catch (e) {
        console.error("Upload Error (Proxy):", e);
        return NextResponse.json({ isSuccess: false, message: "Yükleme proxy sırasında hata oluştu." }, { status: 500 });
    }
}
