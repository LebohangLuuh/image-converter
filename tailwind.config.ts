import type { Config } from "tailwindcss";
import { myCustomTheme } from "./src/my-custom-theme";
import { skeleton } from "@skeletonlabs/tw-plugin";

const tailwindConfig: Config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {}
  },

  


  plugins: [
   skeleton ({
      themes: {
        custom: [
          myCustomTheme
        ]
      }
    })]
};

export default tailwindConfig;