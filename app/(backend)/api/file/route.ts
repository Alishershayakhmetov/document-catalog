import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  parseFilesFormData,
  saveFilesToFolder,
} from "@/lib/server/file-upload.service";
import path from "path";
import fs from "fs/promises";

