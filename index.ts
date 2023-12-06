import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import Elysia from "elysia";
import postcss from "postcss";
import tw, { Config } from "tailwindcss";

type Options = {
	minify?: boolean;
	map?: boolean;
	autoprefixer?: boolean;
};

export const tailwind = (settings: {
	path: string;
	source: string;
	config: Config | string;
	options?: Options;
}) => {
	const {
		path,
		source,
		config,
		options: {
			minify = Bun.env.NODE_ENV === "production",
			map = Bun.env.NODE_ENV !== "production",
			autoprefixer = true,
		} = {},
	} = settings;

	const result = Bun.file(source)
		.text()
		.then((sourceText) => {
			const plugins = [tw(config)];

			if (autoprefixer) {
				plugins.push(require("autoprefixer")());
			}

			if (minify) {
				plugins.push(require("cssnano")());
			}

			return postcss(...plugins).process(sourceText, {
				from: source,
				map,
			});
		})
		.then(({ css }) => css);

	return new Elysia({ name: "tailwind", seed: settings }).get(
		path,
		async ({ set }) => {
			set.headers["content-type"] = "text/css";
			return result;
		},
	);
};
