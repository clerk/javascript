// this script aligns all language files to the en-US file
// if a key is missing from the target language, it will be added with en-US value
// if a key is missing from the en-US file, it will be removed from the target language
// if a key is present in both files, it will be kept as is
// this script also sorts the keys alphabetically
// to parse a language that errors in typescript, you should add at the top of the file:

import * as path from 'node:path';

import * as fs from 'fs';

import { arSA } from '../ar-SA';
import { beBY } from '../be-BY';
import { bgBG } from '../bg-BG';
import { bnIN } from '../bn-IN';
import { caES } from '../ca-ES';
import { csCZ } from '../cs-CZ';
import { daDK } from '../da-DK';
import { deDE } from '../de-DE';
import { elGR } from '../el-GR';
import { enGB } from '../en-GB';
import { enUS } from '../en-US';
import { esCR } from '../es-CR';
import { esES } from '../es-ES';
import { esMX } from '../es-MX';
import { esUY } from '../es-UY';
import { faIR } from '../fa-IR';
import { fiFI } from '../fi-FI';
import { frFR } from '../fr-FR';
import { heIL } from '../he-IL';
import { hiIN } from '../hi-IN';
import { hrHR } from '../hr-HR';
import { huHU } from '../hu-HU';
import { idID } from '../id-ID';
import { isIS } from '../is-IS';
import { itIT } from '../it-IT';
import { jaJP } from '../ja-JP';
import { kkKZ } from '../kk-KZ';
import { koKR } from '../ko-KR';
import { mnMN } from '../mn-MN';
import { msMY } from '../ms-MY';
import { nbNO } from '../nb-NO';
import { nlBE } from '../nl-BE';
import { nlNL } from '../nl-NL';
import { plPL } from '../pl-PL';
import { ptBR } from '../pt-BR';
import { ptPT } from '../pt-PT';
import { roRO } from '../ro-RO';
import { ruRU } from '../ru-RU';
import { skSK } from '../sk-SK';
import { srRS } from '../sr-RS';
import { svSE } from '../sv-SE';
import { taIN } from '../ta-IN';
import { teIN } from '../te-IN';
import { thTH } from '../th-TH';
import { trTR } from '../tr-TR';
import { ukUA } from '../uk-UA';
import { viVN } from '../vi-VN';
import { zhCN } from '../zh-CN';
import { zhTW } from '../zh-TW';
import { enUS_v4 } from './enUS_v4';
import { createObject, getCommonKeys, getKeys, getUniqueKeys, getValue, mergeObjects } from './utils';

const SET_UNDEFINED_ON_THE_CHANGED_KEYS = false;

const disclaimer = `
/*
 * =====================================================================================
 * DISCLAIMER:
 * =====================================================================================
 * This localization file is a community contribution and is not officially maintained
 * by Clerk. It has been provided by the community and may not be fully aligned
 * with the current or future states of the main application. Clerk does not guarantee
 * the accuracy, completeness, or timeliness of the translations in this file.
 * Use of this file is at your own risk and discretion.
 * =====================================================================================
 */
 `;
const initialText = (locale: string) => `

import type { LocalizationResource } from '@clerk/shared/types';

export const ${locale}: LocalizationResource = `;

function alignKeys(source: any, target: any) {
  // Add or update keys from the source to the target
  Object.keys(source).forEach(key => {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      alignKeys(source[key], target[key]);
    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
      target[key] = undefined;
    }
  });

  // Remove keys in the target that are not in the source
  Object.keys(target).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(source, key)) {
      delete target[key];
    }
  });
}

function sortObject(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sortedObj: Record<string, any> = {};
  if (Object.prototype.hasOwnProperty.call(obj, 'locale')) {
    sortedObj['locale'] = obj['locale'];
  }
  Object.keys(obj)
    .sort()
    .forEach(key => {
      if (key !== 'locale') {
        sortedObj[key] = sortObject(obj[key]);
      }
    });

  return sortedObj;
}

function enUSKeysWithChangedValues(enUS_v4: any, enUS_v5: any) {
  const v4Keys = getKeys(enUS_v4);
  const v5Keys = getKeys(enUS_v5);

  const addedKeys = getUniqueKeys(v5Keys, v4Keys).map((key: any) => ({ key, value: undefined }));

  const commonKeys = getCommonKeys(v4Keys, v5Keys);
  const updatedKeys = commonKeys.reduce((acc: any, key: any) => {
    const v4Value = getValue(enUS_v4, key);
    const v5Value = getValue(enUS_v5, key);
    if (v4Value !== v5Value) {
      acc.push({ key, value: undefined });
    }
    return acc;
  }, []);

  const addedKeysObj = createObject(addedKeys);
  const updatedKeysObj = createObject(updatedKeys);

  return mergeObjects(addedKeysObj, updatedKeysObj);
}

const updatedEnUSKeys = enUSKeysWithChangedValues(enUS_v4, enUS);

function run(langObj: any, name: string) {
  const target = langObj;

  alignKeys(enUS, target);
  let sorted = sortObject(target);

  if (SET_UNDEFINED_ON_THE_CHANGED_KEYS && name !== 'en-US') {
    sorted = mergeObjects(sorted, updatedEnUSKeys);
  }

  // convert to JSON and write to text file in typescript format
  const json = JSON.stringify(sorted, (k, v) => (v === undefined ? '__$_cl_replaceable_undefined' : v), 2).replace(
    /"__\$_cl_replaceable_undefined"/g,
    'undefined',
  );
  const disclaimerText = name !== 'en-US' ? disclaimer : '';

  const finalText = disclaimerText + initialText(name.replace('-', '')) + json + ' as const;';

  fs.writeFileSync(path.join(__dirname, `../${name}.ts`), finalText);
}

run(enUS, 'en-US');
run(elGR, 'el-GR');
run(arSA, 'ar-SA');
run(beBY, 'be-BY');
run(bnIN, 'bn-IN');
run(caES, 'ca-ES');
run(csCZ, 'cs-CZ');
run(daDK, 'da-DK');
run(deDE, 'de-DE');
run(enGB, 'en-GB');
run(esCR, 'es-CR');
run(esES, 'es-ES');
run(esMX, 'es-MX');
run(esUY, 'es-UY');
run(faIR, 'fa-IR');
run(frFR, 'fr-FR');
run(fiFI, 'fi-FI');
run(heIL, 'he-IL');
run(hiIN, 'hi-IN');
run(hrHR, 'hr-HR');
run(idID, 'id-ID');
run(isIS, 'is-IS');
run(itIT, 'it-IT');
run(jaJP, 'ja-JP');
run(koKR, 'ko-KR');
run(kkKZ, 'kk-KZ');
run(mnMN, 'mn-MN');
run(msMY, 'ms-MY');
run(nlBE, 'nl-BE');
run(nbNO, 'nb-NO');
run(nlNL, 'nl-NL');
run(plPL, 'pl-PL');
run(ptBR, 'pt-BR');
run(ptPT, 'pt-PT');
run(roRO, 'ro-RO');
run(ruRU, 'ru-RU');
run(skSK, 'sk-SK');
run(svSE, 'sv-SE');
run(taIN, 'ta-IN');
run(teIN, 'te-IN');
run(trTR, 'tr-TR');
run(ukUA, 'uk-UA');
run(viVN, 'vi-VN');
run(zhCN, 'zh-CN');
run(zhTW, 'zh-TW');
run(bgBG, 'bg-BG');
run(thTH, 'th-TH');
run(huHU, 'hu-HU');
run(srRS, 'sr-RS');
