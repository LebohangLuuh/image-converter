
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
		"--on-secondary": "255 255 255",
		"--on-tertiary": "255 255 255",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "0 0 0",
		// =~= Theme Colors  =~=
		// primary | #24afb2 
		"--color-primary-50": "222 243 243", // #def3f3
		"--color-primary-100": "211 239 240", // #d3eff0
		"--color-primary-200": "200 235 236", // #c8ebec
		"--color-primary-300": "167 223 224", // #a7dfe0
		"--color-primary-400": "102 199 201", // #66c7c9
		"--color-primary-500": "36 175 178", // #24afb2
		"--color-primary-600": "32 158 160", // #209ea0
		"--color-primary-700": "27 131 134", // #1b8386
		"--color-primary-800": "22 105 107", // #16696b
		"--color-primary-900": "18 86 87", // #125657
		// secondary | #eeff05 
		"--color-secondary-50": "252 255 218", // #fcffda
		"--color-secondary-100": "252 255 205", // #fcffcd
		"--color-secondary-200": "251 255 193", // #fbffc1
		"--color-secondary-300": "248 255 155", // #f8ff9b
		"--color-secondary-400": "243 255 80", // #f3ff50
		"--color-secondary-500": "238 255 5", // #eeff05
		"--color-secondary-600": "214 230 5", // #d6e605
		"--color-secondary-700": "179 191 4", // #b3bf04
		"--color-secondary-800": "143 153 3", // #8f9903
		"--color-secondary-900": "117 125 2", // #757d02
		// tertiary | #8bee9f 
		"--color-tertiary-50": "238 252 241", // #eefcf1
		"--color-tertiary-100": "232 252 236", // #e8fcec
		"--color-tertiary-200": "226 251 231", // #e2fbe7
		"--color-tertiary-300": "209 248 217", // #d1f8d9
		"--color-tertiary-400": "174 243 188", // #aef3bc
		"--color-tertiary-500": "139 238 159", // #8bee9f
		"--color-tertiary-600": "125 214 143", // #7dd68f
		"--color-tertiary-700": "104 179 119", // #68b377
		"--color-tertiary-800": "83 143 95", // #538f5f
		"--color-tertiary-900": "68 117 78", // #44754e
		// success | #3859ff 
		"--color-success-50": "225 230 255", // #e1e6ff
		"--color-success-100": "215 222 255", // #d7deff
		"--color-success-200": "205 214 255", // #cdd6ff
		"--color-success-300": "175 189 255", // #afbdff
		"--color-success-400": "116 139 255", // #748bff
		"--color-success-500": "56 89 255", // #3859ff
		"--color-success-600": "50 80 230", // #3250e6
		"--color-success-700": "42 67 191", // #2a43bf
		"--color-success-800": "34 53 153", // #223599
		"--color-success-900": "27 44 125", // #1b2c7d
		// warning | #d06c15 
		"--color-warning-50": "248 233 220", // #f8e9dc
		"--color-warning-100": "246 226 208", // #f6e2d0
		"--color-warning-200": "243 218 197", // #f3dac5
		"--color-warning-300": "236 196 161", // #ecc4a1
		"--color-warning-400": "222 152 91", // #de985b
		"--color-warning-500": "208 108 21", // #d06c15
		"--color-warning-600": "187 97 19", // #bb6113
		"--color-warning-700": "156 81 16", // #9c5110
		"--color-warning-800": "125 65 13", // #7d410d
		"--color-warning-900": "102 53 10", // #66350a
		// error | #4e2fa8 
		"--color-error-50": "228 224 242", // #e4e0f2
		"--color-error-100": "220 213 238", // #dcd5ee
		"--color-error-200": "211 203 233", // #d3cbe9
		"--color-error-300": "184 172 220", // #b8acdc
		"--color-error-400": "131 109 194", // #836dc2
		"--color-error-500": "78 47 168", // #4e2fa8
		"--color-error-600": "70 42 151", // #462a97
		"--color-error-700": "59 35 126", // #3b237e
		"--color-error-800": "47 28 101", // #2f1c65
		"--color-error-900": "38 23 82", // #261752
		// surface | #598e91 
		"--color-surface-50": "230 238 239", // #e6eeef
		"--color-surface-100": "222 232 233", // #dee8e9
		"--color-surface-200": "214 227 228", // #d6e3e4
		"--color-surface-300": "189 210 211", // #bdd2d3
		"--color-surface-400": "139 176 178", // #8bb0b2
		"--color-surface-500": "89 142 145", // #598e91
		"--color-surface-600": "80 128 131", // #508083
		"--color-surface-700": "67 107 109", // #436b6d
		"--color-surface-800": "53 85 87", // #355557
		"--color-surface-900": "44 70 71", // #2c4647
		
	}
}