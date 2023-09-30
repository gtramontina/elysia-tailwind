import Elysia from "elysia";
import { tailwind } from "./index.ts";
import { describe, expect, it } from "bun:test";

const get = (path: string) =>
	new Request({ method: "GET", url: `http://localhost${path}` });

const testSettings = {
	source: "./test.tailwind.css",
	config: {
		content: ["**/*.ts"],
		theme: { extend: {} },
		plugins: [],
	},
};

describe("elysia tailwind", () => {
	it("serves a compiled tailwind stylesheet on the configured path", async () => {
		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("text/css");
		expect(await response.text()).toStartWith("/*\n! tailwindcss");
	});

	it("minifies when NODE_ENV is production", async () => {
		Bun.env.NODE_ENV = "production";

		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).toStartWith("/*! tailwindcss");
	});

	it("minifies when option is set", async () => {
		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
				options: { minify: true },
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).toStartWith("/*! tailwindcss");
	});

	it("does not include source maps when NODE_ENV is production", async () => {
		Bun.env.NODE_ENV = "production";

		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).not.toContain("# sourceMappingURL=");
	});

	it("includes source maps when NODE_ENV is not production", async () => {
		Bun.env.NODE_ENV = "not production";

		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).toContain("# sourceMappingURL=");
	});

	it("includes source maps when option is set", async () => {
		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
				options: { map: true },
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).toContain("# sourceMappingURL=");
	});

	it("runs autoprefixer by default", async () => {
		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).toContain("-o-");
	});

	it("does not run autoprefixer when option is set to false", async () => {
		const app = new Elysia().use(
			tailwind({
				...testSettings,
				path: "/public/stylesheet.css",
				options: { autoprefixer: false },
			}),
		);

		const response = await app.handle(get("/public/stylesheet.css"));
		expect(await response.text()).not.toContain("-o-");
	});
});
