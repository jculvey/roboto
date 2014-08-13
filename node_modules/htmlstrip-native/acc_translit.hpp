// functions to transliterate accented characters
#ifndef ACCENTED_TRANSLITERATE_H
#define ACCENTED_TRANSLITERATE_H

static inline bool
transliterate_accented_norm(uint16_t* inBuf, size_t &i, uint16_t* &outBuf){
	switch(inBuf[i]){
		case 0x00c4: // 'Ä'
			*outBuf++ = 0x0041; // 'A'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00d6: // 'Ö'
			*outBuf++ = 0x004f; // 'O'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00dc: // 'Ü'
			*outBuf++ = 0x0055; // 'U'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00e4: // 'ä'
			*outBuf++ = 0x0061; // 'a'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00f6: // 'ö'
			*outBuf++ = 0x006f; // 'o'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00fc: // 'ü'
			*outBuf++ = 0x0075; // 'u'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00df: // 'ß'
			*outBuf++ = 0x0073; // 's'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x00c0: // 'À'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c1: // 'Á'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c2: // 'Â'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c3: // 'Ã'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c5: // 'Å'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x0100: // 'Ā'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x0104: // 'Ą'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x0102: // 'Ă'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c6: // 'Æ'
			*outBuf++ = 0x0041; // 'A'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00c7: // 'Ç'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x0106: // 'Ć'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x010c: // 'Č'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x0108: // 'Ĉ'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x010a: // 'Ċ'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x010e: // 'Ď'
			*outBuf++ = 0x0044; // 'D'
			return true;
		case 0x0110: // 'Đ'
			*outBuf++ = 0x0044; // 'D'
			return true;
		case 0x00c8: // 'È'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00c9: // 'É'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00ca: // 'Ê'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00cb: // 'Ë'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0112: // 'Ē'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0118: // 'Ę'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x011a: // 'Ě'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0114: // 'Ĕ'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0116: // 'Ė'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x011c: // 'Ĝ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x011e: // 'Ğ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x0120: // 'Ġ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x0122: // 'Ģ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x0124: // 'Ĥ'
			*outBuf++ = 0x0048; // 'H'
			return true;
		case 0x0126: // 'Ħ'
			*outBuf++ = 0x0048; // 'H'
			return true;
		case 0x00cc: // 'Ì'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x00cd: // 'Í'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x00ce: // 'Î'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x00cf: // 'Ï'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x012a: // 'Ī'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x0128: // 'Ĩ'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x012c: // 'Ĭ'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x012e: // 'Į'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x0130: // 'İ'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x0132: // 'Ĳ'
			*outBuf++ = 0x004a; // 'J'
			return true;
		case 0x0134: // 'Ĵ'
			*outBuf++ = 0x004a; // 'J'
			return true;
		case 0x0136: // 'Ķ'
			*outBuf++ = 0x004b; // 'K'
			return true;
		case 0x0141: // 'Ł'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x013d: // 'Ľ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x0139: // 'Ĺ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x013b: // 'Ļ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x013f: // 'Ŀ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x00d1: // 'Ñ'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x0143: // 'Ń'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x0147: // 'Ň'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x0145: // 'Ņ'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x014a: // 'Ŋ'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x00d2: // 'Ò'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d3: // 'Ó'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d4: // 'Ô'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d5: // 'Õ'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d8: // 'Ø'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x014c: // 'Ō'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x0150: // 'Ő'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x014e: // 'Ŏ'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x0152: // 'Œ'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0154: // 'Ŕ'
			*outBuf++ = 0x0052; // 'R'
			return true;
		case 0x0158: // 'Ř'
			*outBuf++ = 0x0052; // 'R'
			return true;
		case 0x0156: // 'Ŗ'
			*outBuf++ = 0x0052; // 'R'
			return true;
		case 0x015a: // 'Ś'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x0160: // 'Š'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x015e: // 'Ş'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x015c: // 'Ŝ'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x0218: // 'Ș'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x0164: // 'Ť'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x0162: // 'Ţ'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x0166: // 'Ŧ'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x021a: // 'Ț'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x00d9: // 'Ù'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x00da: // 'Ú'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x00db: // 'Û'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x016a: // 'Ū'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x016e: // 'Ů'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0170: // 'Ű'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x016c: // 'Ŭ'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0168: // 'Ũ'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0172: // 'Ų'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0174: // 'Ŵ'
			*outBuf++ = 0x0057; // 'W'
			return true;
		case 0x00dd: // 'Ý'
			*outBuf++ = 0x0059; // 'Y'
			return true;
		case 0x0176: // 'Ŷ'
			*outBuf++ = 0x0059; // 'Y'
			return true;
		case 0x0178: // 'Ÿ'
			*outBuf++ = 0x0059; // 'Y'
			return true;
		case 0x0179: // 'Ź'
			*outBuf++ = 0x005a; // 'Z'
			return true;
		case 0x017d: // 'Ž'
			*outBuf++ = 0x005a; // 'Z'
			return true;
		case 0x017b: // 'Ż'
			*outBuf++ = 0x005a; // 'Z'
			return true;
		case 0x00e0: // 'à'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e1: // 'á'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e2: // 'â'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e3: // 'ã'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e5: // 'å'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x0101: // 'ā'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x0105: // 'ą'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x0103: // 'ă'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e6: // 'æ'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00e7: // 'ç'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x0107: // 'ć'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x010d: // 'č'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x0109: // 'ĉ'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x010b: // 'ċ'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x010f: // 'ď'
			*outBuf++ = 0x0064; // 'd'
			return true;
		case 0x0111: // 'đ'
			*outBuf++ = 0x0064; // 'd'
			return true;
		case 0x00e8: // 'è'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00e9: // 'é'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00ea: // 'ê'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00eb: // 'ë'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0113: // 'ē'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0119: // 'ę'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x011b: // 'ě'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0115: // 'ĕ'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0117: // 'ė'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0192: // 'ƒ'
			*outBuf++ = 0x0066; // 'f'
			return true;
		case 0x011d: // 'ĝ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x011f: // 'ğ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x0121: // 'ġ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x0123: // 'ģ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x0125: // 'ĥ'
			*outBuf++ = 0x0068; // 'h'
			return true;
		case 0x0127: // 'ħ'
			*outBuf++ = 0x0068; // 'h'
			return true;
		case 0x00ec: // 'ì'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x00ed: // 'í'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x00ee: // 'î'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x00ef: // 'ï'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x012b: // 'ī'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x0129: // 'ĩ'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x012d: // 'ĭ'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x012f: // 'į'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x0131: // 'ı'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x0133: // 'ĳ'
			*outBuf++ = 0x006a; // 'j'
			return true;
		case 0x0135: // 'ĵ'
			*outBuf++ = 0x006a; // 'j'
			return true;
		case 0x0137: // 'ķ'
			*outBuf++ = 0x006b; // 'k'
			return true;
		case 0x0138: // 'ĸ'
			*outBuf++ = 0x006b; // 'k'
			return true;
		case 0x0142: // 'ł'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x013e: // 'ľ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x013a: // 'ĺ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x013c: // 'ļ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x0140: // 'ŀ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x00f1: // 'ñ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0144: // 'ń'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0148: // 'ň'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0146: // 'ņ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0149: // 'ŉ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x014b: // 'ŋ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x00f2: // 'ò'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f3: // 'ó'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f4: // 'ô'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f5: // 'õ'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f8: // 'ø'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x014d: // 'ō'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x0151: // 'ő'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x014f: // 'ŏ'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x0153: // 'œ'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0155: // 'ŕ'
			*outBuf++ = 0x0072; // 'r'
			return true;
		case 0x0159: // 'ř'
			*outBuf++ = 0x0072; // 'r'
			return true;
		case 0x0157: // 'ŗ'
			*outBuf++ = 0x0072; // 'r'
			return true;
		case 0x015b: // 'ś'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x0161: // 'š'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x015f: // 'ş'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x015d: // 'ŝ'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x0219: // 'ș'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x0165: // 'ť'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x0163: // 'ţ'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x0167: // 'ŧ'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x021b: // 'ț'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x00f9: // 'ù'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x00fa: // 'ú'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x00fb: // 'û'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x016b: // 'ū'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x016f: // 'ů'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0171: // 'ű'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x016d: // 'ŭ'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0169: // 'ũ'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0173: // 'ų'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0175: // 'ŵ'
			*outBuf++ = 0x0077; // 'w'
			return true;
		case 0x00fd: // 'ý'
			*outBuf++ = 0x0079; // 'y'
			return true;
		case 0x00ff: // 'ÿ'
			*outBuf++ = 0x0079; // 'y'
			return true;
		case 0x0177: // 'ŷ'
			*outBuf++ = 0x0079; // 'y'
			return true;
		case 0x017e: // 'ž'
			*outBuf++ = 0x007a; // 'z'
			return true;
		case 0x017c: // 'ż'
			*outBuf++ = 0x007a; // 'z'
			return true;
		case 0x017a: // 'ź'
			*outBuf++ = 0x007a; // 'z'
			return true;
		case 0x00de: // 'Þ'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x00fe: // 'þ'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x017f: // 'ſ'
			*outBuf++ = 0x0066; // 'f'
			return true;
		case 0x00d0: // 'Ð'
			*outBuf++ = 0x0044; // 'D'
			return true;
		case 0x00f0: // 'ð'
			*outBuf++ = 0x0064; // 'd'
			return true;
		default: return false;
	}
}

static inline bool
transliterate_accented_strip(uint16_t* inBuf, size_t &i, uint16_t* &outBuf){
	switch(inBuf[i]){
		case 0x00c0: // 'À'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c1: // 'Á'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c2: // 'Â'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c3: // 'Ã'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c4: // 'Ä'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c5: // 'Å'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x0100: // 'Ā'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x0104: // 'Ą'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x0102: // 'Ă'
			*outBuf++ = 0x0041; // 'A'
			return true;
		case 0x00c6: // 'Æ'
			*outBuf++ = 0x0041; // 'A'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00c7: // 'Ç'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x0106: // 'Ć'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x010c: // 'Č'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x0108: // 'Ĉ'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x010a: // 'Ċ'
			*outBuf++ = 0x0043; // 'C'
			return true;
		case 0x010e: // 'Ď'
			*outBuf++ = 0x0044; // 'D'
			return true;
		case 0x0110: // 'Đ'
			*outBuf++ = 0x0044; // 'D'
			return true;
		case 0x00c8: // 'È'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00c9: // 'É'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00ca: // 'Ê'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x00cb: // 'Ë'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0112: // 'Ē'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0118: // 'Ę'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x011a: // 'Ě'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0114: // 'Ĕ'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0116: // 'Ė'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x011c: // 'Ĝ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x011e: // 'Ğ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x0120: // 'Ġ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x0122: // 'Ģ'
			*outBuf++ = 0x0047; // 'G'
			return true;
		case 0x0124: // 'Ĥ'
			*outBuf++ = 0x0048; // 'H'
			return true;
		case 0x0126: // 'Ħ'
			*outBuf++ = 0x0048; // 'H'
			return true;
		case 0x00cc: // 'Ì'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x00cd: // 'Í'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x00ce: // 'Î'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x00cf: // 'Ï'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x012a: // 'Ī'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x0128: // 'Ĩ'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x012c: // 'Ĭ'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x012e: // 'Į'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x0130: // 'İ'
			*outBuf++ = 0x0049; // 'I'
			return true;
		case 0x0132: // 'Ĳ'
			*outBuf++ = 0x004a; // 'J'
			return true;
		case 0x0134: // 'Ĵ'
			*outBuf++ = 0x004a; // 'J'
			return true;
		case 0x0136: // 'Ķ'
			*outBuf++ = 0x004b; // 'K'
			return true;
		case 0x0141: // 'Ł'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x013d: // 'Ľ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x0139: // 'Ĺ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x013b: // 'Ļ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x013f: // 'Ŀ'
			*outBuf++ = 0x004c; // 'L'
			return true;
		case 0x00d1: // 'Ñ'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x0143: // 'Ń'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x0147: // 'Ň'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x0145: // 'Ņ'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x014a: // 'Ŋ'
			*outBuf++ = 0x004e; // 'N'
			return true;
		case 0x00d2: // 'Ò'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d3: // 'Ó'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d4: // 'Ô'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d5: // 'Õ'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d6: // 'Ö'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x00d8: // 'Ø'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x014c: // 'Ō'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x0150: // 'Ő'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x014e: // 'Ŏ'
			*outBuf++ = 0x004f; // 'O'
			return true;
		case 0x0152: // 'Œ'
			*outBuf++ = 0x0045; // 'E'
			return true;
		case 0x0154: // 'Ŕ'
			*outBuf++ = 0x0052; // 'R'
			return true;
		case 0x0158: // 'Ř'
			*outBuf++ = 0x0052; // 'R'
			return true;
		case 0x0156: // 'Ŗ'
			*outBuf++ = 0x0052; // 'R'
			return true;
		case 0x015a: // 'Ś'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x0160: // 'Š'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x015e: // 'Ş'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x015c: // 'Ŝ'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x0218: // 'Ș'
			*outBuf++ = 0x0053; // 'S'
			return true;
		case 0x0164: // 'Ť'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x0162: // 'Ţ'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x0166: // 'Ŧ'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x021a: // 'Ț'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x00d9: // 'Ù'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x00da: // 'Ú'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x00db: // 'Û'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x00dc: // 'Ü'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x016a: // 'Ū'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x016e: // 'Ů'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0170: // 'Ű'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x016c: // 'Ŭ'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0168: // 'Ũ'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0172: // 'Ų'
			*outBuf++ = 0x0055; // 'U'
			return true;
		case 0x0174: // 'Ŵ'
			*outBuf++ = 0x0057; // 'W'
			return true;
		case 0x00dd: // 'Ý'
			*outBuf++ = 0x0059; // 'Y'
			return true;
		case 0x0176: // 'Ŷ'
			*outBuf++ = 0x0059; // 'Y'
			return true;
		case 0x0178: // 'Ÿ'
			*outBuf++ = 0x0059; // 'Y'
			return true;
		case 0x0179: // 'Ź'
			*outBuf++ = 0x005a; // 'Z'
			return true;
		case 0x017d: // 'Ž'
			*outBuf++ = 0x005a; // 'Z'
			return true;
		case 0x017b: // 'Ż'
			*outBuf++ = 0x005a; // 'Z'
			return true;
		case 0x00e0: // 'à'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e1: // 'á'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e2: // 'â'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e3: // 'ã'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e4: // 'ä'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e5: // 'å'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x0101: // 'ā'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x0105: // 'ą'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x0103: // 'ă'
			*outBuf++ = 0x0061; // 'a'
			return true;
		case 0x00e6: // 'æ'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00e7: // 'ç'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x0107: // 'ć'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x010d: // 'č'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x0109: // 'ĉ'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x010b: // 'ċ'
			*outBuf++ = 0x0063; // 'c'
			return true;
		case 0x010f: // 'ď'
			*outBuf++ = 0x0064; // 'd'
			return true;
		case 0x0111: // 'đ'
			*outBuf++ = 0x0064; // 'd'
			return true;
		case 0x00e8: // 'è'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00e9: // 'é'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00ea: // 'ê'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x00eb: // 'ë'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0113: // 'ē'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0119: // 'ę'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x011b: // 'ě'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0115: // 'ĕ'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0117: // 'ė'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0192: // 'ƒ'
			*outBuf++ = 0x0066; // 'f'
			return true;
		case 0x011d: // 'ĝ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x011f: // 'ğ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x0121: // 'ġ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x0123: // 'ģ'
			*outBuf++ = 0x0067; // 'g'
			return true;
		case 0x0125: // 'ĥ'
			*outBuf++ = 0x0068; // 'h'
			return true;
		case 0x0127: // 'ħ'
			*outBuf++ = 0x0068; // 'h'
			return true;
		case 0x00ec: // 'ì'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x00ed: // 'í'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x00ee: // 'î'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x00ef: // 'ï'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x012b: // 'ī'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x0129: // 'ĩ'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x012d: // 'ĭ'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x012f: // 'į'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x0131: // 'ı'
			*outBuf++ = 0x0069; // 'i'
			return true;
		case 0x0133: // 'ĳ'
			*outBuf++ = 0x006a; // 'j'
			return true;
		case 0x0135: // 'ĵ'
			*outBuf++ = 0x006a; // 'j'
			return true;
		case 0x0137: // 'ķ'
			*outBuf++ = 0x006b; // 'k'
			return true;
		case 0x0138: // 'ĸ'
			*outBuf++ = 0x006b; // 'k'
			return true;
		case 0x0142: // 'ł'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x013e: // 'ľ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x013a: // 'ĺ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x013c: // 'ļ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x0140: // 'ŀ'
			*outBuf++ = 0x006c; // 'l'
			return true;
		case 0x00f1: // 'ñ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0144: // 'ń'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0148: // 'ň'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0146: // 'ņ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x0149: // 'ŉ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x014b: // 'ŋ'
			*outBuf++ = 0x006e; // 'n'
			return true;
		case 0x00f2: // 'ò'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f3: // 'ó'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f4: // 'ô'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f5: // 'õ'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f6: // 'ö'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x00f8: // 'ø'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x014d: // 'ō'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x0151: // 'ő'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x014f: // 'ŏ'
			*outBuf++ = 0x006f; // 'o'
			return true;
		case 0x0153: // 'œ'
			*outBuf++ = 0x0065; // 'e'
			return true;
		case 0x0155: // 'ŕ'
			*outBuf++ = 0x0072; // 'r'
			return true;
		case 0x0159: // 'ř'
			*outBuf++ = 0x0072; // 'r'
			return true;
		case 0x0157: // 'ŗ'
			*outBuf++ = 0x0072; // 'r'
			return true;
		case 0x015b: // 'ś'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x0161: // 'š'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x015f: // 'ş'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x015d: // 'ŝ'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x0219: // 'ș'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x0165: // 'ť'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x0163: // 'ţ'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x0167: // 'ŧ'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x021b: // 'ț'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x00f9: // 'ù'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x00fa: // 'ú'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x00fb: // 'û'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x00fc: // 'ü'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x016b: // 'ū'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x016f: // 'ů'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0171: // 'ű'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x016d: // 'ŭ'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0169: // 'ũ'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0173: // 'ų'
			*outBuf++ = 0x0075; // 'u'
			return true;
		case 0x0175: // 'ŵ'
			*outBuf++ = 0x0077; // 'w'
			return true;
		case 0x00fd: // 'ý'
			*outBuf++ = 0x0079; // 'y'
			return true;
		case 0x00ff: // 'ÿ'
			*outBuf++ = 0x0079; // 'y'
			return true;
		case 0x0177: // 'ŷ'
			*outBuf++ = 0x0079; // 'y'
			return true;
		case 0x017e: // 'ž'
			*outBuf++ = 0x007a; // 'z'
			return true;
		case 0x017c: // 'ż'
			*outBuf++ = 0x007a; // 'z'
			return true;
		case 0x017a: // 'ź'
			*outBuf++ = 0x007a; // 'z'
			return true;
		case 0x00de: // 'Þ'
			*outBuf++ = 0x0054; // 'T'
			return true;
		case 0x00fe: // 'þ'
			*outBuf++ = 0x0074; // 't'
			return true;
		case 0x00df: // 'ß'
			*outBuf++ = 0x0073; // 's'
			*outBuf++ = 0x0073; // 's'
			return true;
		case 0x017f: // 'ſ'
			*outBuf++ = 0x0066; // 'f'
			return true;
		case 0x00d0: // 'Ð'
			*outBuf++ = 0x0044; // 'D'
			return true;
		case 0x00f0: // 'ð'
			*outBuf++ = 0x0064; // 'd'
			return true;
		default: return false;
	}
}


#endif // ACCENTED_TRANSLITERATE_H