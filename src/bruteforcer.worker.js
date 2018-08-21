/* global self */
/* eslint no-restricted-globals: ["off", "self"] */

import TronTools from 'tron-http-tools';
import wordList from 'wordList';

self.onmessage = ({ data }) => { // eslint-disable-line no-unused-vars no-restricted-globals
    const {
        words,
        address,
        unknown
    } = data;

    console.log({ words, address, unknown });

    for(let i = 0; i < wordList.length; i++) {
        const word = wordList[i];

        console.log(`Trying word ${i + 1} of ${wordList.length}: ${word}`);

        self.postMessage({
            type: 'stateUpdate',
            status: `Trying word ${i + 1} of ${wordList.length}: ${word}`
        });

        words[unknown] = word;

        const {
            address: generatedAddress
        } = TronTools.accounts.accountFromMnemonicString(words.join(' '));

        if(generatedAddress !== address)
            continue;

        self.postMessage({
            type: 'success',
            word,
            words
        });

        break;
    }

    self.postMessage({
        type: 'fail'
    });
};