import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "comments.json");

// Ensure data directory exists
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
}

export async function GET() {
  ensureDataFile();
  const comments = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  return NextResponse.json(comments);
}

export async function POST(req: Request) {
  try {
    ensureDataFile();
    const { author, body } = await req.json();

    if (!author || !body) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const comments = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const newComment = {
      id: Date.now(),
      author,
      body,
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);
    fs.writeFileSync(DATA_FILE, JSON.stringify(comments, null, 2));

    return NextResponse.json(newComment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
