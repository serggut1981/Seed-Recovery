import TronTools from 'tron-http-tools';
import wordList from 'wordList';

// eslint-disable-next-line
onmessage = ({ data }) => {
    const {
        words,
        address,
        unknown
    } = data;

    for(let i = 0; i < wordList.length; i++) {
        const word = wordList[i];

        postMessage({
            type: 'stateUpdate',
            status: `Trying word ${i + 1} of ${wordList.length}: ${word}`
        });

        words[unknown] = word;

        const {
            address: generatedAddress
        } = TronTools.accounts.accountFromMnemonicString(words.join(' '));

        if(generatedAddress !== address)
            continue;

        return postMessage({
            type: 'success',
            word,
            words
        });
    }

    postMessage({
        type: 'fail'
    });
};