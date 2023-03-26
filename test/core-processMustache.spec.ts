import {expect} from './testlib';

import { IJson } from 'jlog-facade';

import { processMustache, IReadConfigOptions } from '@fp8proj/core';



const data: IJson = {
    data: {
        city: 'New York',
        domain: 'example.com',
        url: 'https://{{data.domain}}/info',
        fp8TestVal: 'Origin: {{data.city}}',
        entry: '{{data.recursive}}',
        recursive: '{{data.recursive2}}',
        recursive2: '{{data.recursive3}}',
        recursive3: '{{data.recursive4}}',
        recursive4: '{{data.recursive5}}',
        recursive5: '{{data.recursive6}}',
        recursive6: '{{data.recursive7}}',
        recursiveSelf: '{{data.recursiveSelf}}'
    }
}

const mustacheOptions: IReadConfigOptions = {};

describe('core-processMustache', () => {
    it('simpleTemplate', () => {
        const template = {
            city: '{{data.city}}',
            testVal: '{{data.fp8TestVal}}',
            url: '{{data.url}}'
        };
        const result = processMustache(template, data, mustacheOptions);
        // console.log('result: ', result);
        expect(result.city).to.eql('New York');
        expect(result.testVal).to.eql('Origin: New York');
        expect(result.url).to.eql('https://example.com/info');
    });

    it('endless template check', () => {
        const template = {
            recursive: '{{data.recursiveSelf}}'
        };
        const result = processMustache(template, data, mustacheOptions);
        // console.log('result: ', result);
        
        // Template render should stop without going into endless loop
        expect(result.recursive).to.eql('{{data.recursiveSelf}}');
    });

    it('recursiveTemplate', () => {
        const template = {
            entry: '{{data.entry}}'
        };
        const result = processMustache(template, data, mustacheOptions);
        // console.log('result: ', result);

        // Template should stop at 5th iteraction
        expect(result.entry).to.eql('{{data.recursive5}}');
    }); 
});
