import "./parts/glide";
import Alpine from "alpinejs";

import collapse from "@alpinejs/collapse";

import Swiper from "swiper/bundle";
import "swiper/css/bundle";

Alpine.plugin(collapse);

Alpine.data("carousel", () => ({
    init() {
        new Swiper(this.$el, {
            slidesPerView: 1,
            loop: true,
            navigation: {
                nextEl: this.$el.querySelector(".swiper-button-next"),
                prevEl: this.$el.querySelector(".swiper-button-prev"),
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
            },
            spaceBetween: 16,
        });
    },
}));

window.Alpine = Alpine;

Alpine.data("blogLoader", () => ({
    posts: [],
    page: 1,
    perPage: 3,
    hasMore: true,
    selectedTags: [],

    toggleTag(slug) {
        this.selectedTags = this.selectedTags.includes(slug)
            ? this.selectedTags.filter((s) => s !== slug)
            : [...this.selectedTags, slug];
        this.resetAndLoad();
    },

    selectAll() {
        this.selectedTags = [];
        this.resetAndLoad();
    },

    resetAndLoad() {
        this.posts = [];
        this.page = 1;
        this.hasMore = true;
        this.loadPosts();
    },

    async loadPosts() {
        try {
            let apiEndpoint = `/api/collections/news/entries?page=${this.page}&limit=${this.perPage}`;

            if (this.selectedTags.length) {
                this.selectedTags.forEach((slug) => {
                    apiEndpoint += `&filter[tags:contains]=${slug}`;
                });
            }

            const res = await fetch(apiEndpoint);
            if (!res.ok) throw new Error(res.status);

            const json = await res.json();

            json.data.forEach((item) => {
                this.posts.push({
                    id: item.id,
                    title: item.title,
                    url: item.url.replace(/^\/api/, ""),
                    date: new Date(item.date).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    }),
                    featuredImage: item.featured_image
                        ? item.featured_image.permalink
                        : "/images/default-news.jpg",
                    authorName: item.author?.name || item.author || "Unknown",
                    tags: (item.tags || []).map((tag) => ({
                        title: tag.title,
                        slug: tag.slug,
                        url: tag.url,
                    })),
                });
            });

            this.hasMore = Boolean(json.links.next);
            this.page++;
        } catch (e) {
            console.error("Failed to load posts", e);
            this.hasMore = false;
        }
    },
}));

Alpine.start();
