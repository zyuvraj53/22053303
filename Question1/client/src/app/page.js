"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4 bg-slate-200">
      <div className="flex space-x-4">
        <Link href="/TopUsers">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Top Users
          </button>
        </Link>
        <Link href="/TrendingPosts">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Trending Posts
          </button>
        </Link>
      </div>
    </div>
  );
}