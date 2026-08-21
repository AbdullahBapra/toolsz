import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "pdf-editor");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate a unique filename to avoid collisions
    const fileExtension = path.extname(file.name) || ".pdf";
    const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Return the URL and filename
    const fileUrl = `/uploads/pdf-editor/${uniqueFilename}`;

    return NextResponse.json({
      url: fileUrl,
      filename: uniqueFilename,
      originalName: file.name
    }, { status: 200 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
