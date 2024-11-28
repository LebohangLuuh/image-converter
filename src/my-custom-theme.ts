
import type { CustomThemeConfig } from '@skeletonlabs/tw-plugin';

export const myCustomTheme: CustomThemeConfig = {
    name: 'my-custom-theme',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `system-ui`,
		"--theme-font-family-heading": `system-ui`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "9999px",
		"--theme-rounded-container": "8px",
		"--theme-border-base": "1px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "0 0 0",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #e76f6f 
		"--color-primary-50": "251 233 233", // #fbe9e9
		"--color-primary-100": "250 226 226", // #fae2e2
		"--color-primary-200": "249 219 219", // #f9dbdb
		"--color-primary-300": "245 197 197", // #f5c5c5
		"--color-primary-400": "238 154 154", // #ee9a9a
		"--color-primary-500": "231 111 111", // #e76f6f
		"--color-primary-600": "208 100 100", // #d06464
		"--color-primary-700": "173 83 83", // #ad5353
		"--color-primary-800": "139 67 67", // #8b4343
		"--color-primary-900": "113 54 54", // #713636
		// secondary | #fff833 
		"--color-secondary-50": "255 254 224", // #fffee0
		"--color-secondary-100": "255 254 214", // #fffed6
		"--color-secondary-200": "255 253 204", // #fffdcc
		"--color-secondary-300": "255 252 173", // #fffcad
		"--color-secondary-400": "255 250 112", // #fffa70
		"--color-secondary-500": "255 248 51", // #fff833
		"--color-secondary-600": "230 223 46", // #e6df2e
		"--color-secondary-700": "191 186 38", // #bfba26
		"--color-secondary-800": "153 149 31", // #99951f
		"--color-secondary-900": "125 122 25", // #7d7a19
		// tertiary | #0ae2ff 
		"--color-tertiary-50": "218 251 255", // #dafbff
		"--color-tertiary-100": "206 249 255", // #cef9ff
		"--color-tertiary-200": "194 248 255", // #c2f8ff
		"--color-tertiary-300": "157 243 255", // #9df3ff
		"--color-tertiary-400": "84 235 255", // #54ebff
		"--color-tertiary-500": "10 226 255", // #0ae2ff
		"--color-tertiary-600": "9 203 230", // #09cbe6
		"--color-tertiary-700": "8 170 191", // #08aabf
		"--color-tertiary-800": "6 136 153", // #068899
		"--color-tertiary-900": "5 111 125", // #056f7d
		// success | #0be02e 
		"--color-success-50": "218 250 224", // #dafae0
		"--color-success-100": "206 249 213", // #cef9d5
		"--color-success-200": "194 247 203", // #c2f7cb
		"--color-success-300": "157 243 171", // #9df3ab
		"--color-success-400": "84 233 109", // #54e96d
		"--color-success-500": "11 224 46", // #0be02e
		"--color-success-600": "10 202 41", // #0aca29
		"--color-success-700": "8 168 35", // #08a823
		"--color-success-800": "7 134 28", // #07861c
		"--color-success-900": "5 110 23", // #056e17
		// warning | #5a65fd 
		"--color-warning-50": "230 232 255", // #e6e8ff
		"--color-warning-100": "222 224 255", // #dee0ff
		"--color-warning-200": "214 217 255", // #d6d9ff
		"--color-warning-300": "189 193 254", // #bdc1fe
		"--color-warning-400": "140 147 254", // #8c93fe
		"--color-warning-500": "90 101 253", // #5a65fd
		"--color-warning-600": "81 91 228", // #515be4
		"--color-warning-700": "68 76 190", // #444cbe
		"--color-warning-800": "54 61 152", // #363d98
		"--color-warning-900": "44 49 124", // #2c317c
		// error | #f50f0f 
		"--color-error-50": "254 219 219", // #fedbdb
		"--color-error-100": "253 207 207", // #fdcfcf
		"--color-error-200": "253 195 195", // #fdc3c3
		"--color-error-300": "251 159 159", // #fb9f9f
		"--color-error-400": "248 87 87", // #f85757
		"--color-error-500": "245 15 15", // #f50f0f
		"--color-error-600": "221 14 14", // #dd0e0e
		"--color-error-700": "184 11 11", // #b80b0b
		"--color-error-800": "147 9 9", // #930909
		"--color-error-900": "120 7 7", // #780707
		// surface | #665261 
		"--color-surface-50": "232 229 231", // #e8e5e7
		"--color-surface-100": "224 220 223", // #e0dcdf
		"--color-surface-200": "217 212 216", // #d9d4d8
		"--color-surface-300": "194 186 192", // #c2bac0
		"--color-surface-400": "148 134 144", // #948690
		"--color-surface-500": "102 82 97", // #665261
		"--color-surface-600": "92 74 87", // #5c4a57
		"--color-surface-700": "77 62 73", // #4d3e49
		"--color-surface-800": "61 49 58", // #3d313a
		"--color-surface-900": "50 40 48", // #322830
		
	}
}