export class XmlParser {
    static extractText(xmlBlock: string, tagName: string): string {
        const match = xmlBlock.match(new RegExp(`<${tagName}>(.*?)</${tagName}>`));
        if (!match) {
            throw new Error(`Missing <${tagName}> in XML block: ${xmlBlock}`);
        }

        return match[1].trim();
    }

    static extractNumber(xmlBlock: string, tagName: string): number {
        const value = this.extractText(xmlBlock, tagName);
        const parsed = Number(value);

        if (Number.isNaN(parsed)) {
            throw new Error(`Value for <${tagName}> is not a valid number: ${value}`);
        }

        return parsed;
    }

    static extractBlocks(xml: string, tagName: string): string[] {
        return [...xml.matchAll(new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'g'))].map(
            (match) => match[1]
        );
    }
}