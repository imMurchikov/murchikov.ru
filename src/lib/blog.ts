import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

interface Post {
    slug: string;
    title: string;
    date: string;
    content: string;
    excerpt?: string;
}

function ensurePostsDirectoryExists() {
    const contentDir = path.join(process.cwd(), "content");
    if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir);
    }

    if (!fs.existsSync(postsDirectory)) {
        fs.mkdirSync(postsDirectory);
    }
}

export function getAllPosts(): Post[] {
    ensurePostsDirectoryExists();

    try {
        const fileNames = fs.readdirSync(postsDirectory);

        const allPosts = fileNames
            .filter((fileName) => fileName.endsWith(".md"))
            .map((fileName) => {
                const slug = fileName.replace(/\.md$/, "");

                const fullPath = path.join(postsDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");

                const { data, content } = matter(fileContents);

                const title = data.title || "untitled";
                const date = data.date
                    ? new Date(data.date).toLocaleDateString("ru-RU")
                    : "Date not specified";

                return {
                    slug,
                    title,
                    date,
                    content,
                    excerpt: data.excerpt || content.trim().slice(0, 160) + "...",
                };
            })
            .sort((a, b) => {
                const dateA =
                    a.date !== "Date not specified" ? new Date(a.date).getTime() : 0;
                const dateB =
                    b.date !== "Date not specified" ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });

        return allPosts;
    } catch (error) {
        console.error("Error when reading posts:", error);
        return [];
    }
}

export function getPostBySlug(slug: string): Post | null {
    ensurePostsDirectoryExists();

    try {
        const fullPath = path.join(postsDirectory, `${slug}.md`);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        const title = data.title || "untitled";
        const date = data.date
            ? new Date(data.date).toLocaleDateString("ru-RU")
            : "Date not specified";

        return {
            slug,
            title,
            date,
            content,
            excerpt: data.excerpt,
        };
    } catch (error) {
        console.error(`Error when receiving a post ${slug}:`, error);
        return null;
    }
}