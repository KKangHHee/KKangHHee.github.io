import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "신강희 | Backend Developer",
  tagline: "견고하고 확장 가능한 백엔드를 지향합니다.",
  // favicon: "img/favicon.ico",

  future: {
    v4: true,
  },

  url: "https://KKangHHee.github.io",
  baseUrl: "/",

  organizationName: "KKangHHee", // Usually your GitHub org/user name.
  projectName: "KKangHHee.github.io", // Usually your repo name.
  deploymentBranch: "gh-pages", // deployment branch

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "ko", // settings language
    locales: ["ko"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/docs",
          // editUrl:
          //   "https://github.com/KKangHHee/KKangHHee.github.io/tree/main/",
        },
        blog: {
          path: "blog",
          routeBasePath: "blog",
          showReadingTime: false,
          blogTitle: "Troubleshooting & Learning",
          blogDescription: "개발 중 겪은 문제와 학습 기록",
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          blogSidebarCount: 0,
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "ignore",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      defaultMode: "light",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Kang-hee.log",
      items: [
        {
          to: "/resume",
          label: "📄 Resume",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          position: "left",
          label: "📁 Projects",
        },
        {
          to: "/blog/index",
          label: "✍️ Blog",
          position: "left",
        },
        {
          href: "https://github.com/KKangHHee",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Copyright © ${new Date().getFullYear()} Kang-hee. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["java", "sql"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
