import { Link } from "react-router";
import { SparklesIcon, HeartIcon } from "lucide-react";

function Footer() {
    return (
        <footer className="bg-base-100 border-t border-base-300">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Brand */}
                    <Link
                        to="/"
                        className="inline-block hover:scale-105 transition-transform duration-200"
                    >
                        <img
                            src="/logo_light.svg"
                            alt="Talent IQ Logo"
                            className="h-12 w-auto object-contain"
                        />
                    </Link>

                    {/* Copyright */}
                    <p className="text-sm text-base-content/50">
                        &copy; 2026 Talent IQ Master. All rights reserved.
                    </p>
                    {/* Built by */}
                    <p className="text-sm text-base-content/60 flex items-center gap-1.5">
                        Built with <HeartIcon className="size-3.5 text-red-500 fill-red-500" /> by{" "}
                        <a href="https://github.com/codeWithAyush2710" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Ayush Srivastava</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;  