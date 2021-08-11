// https://images.weserv.nl/
// <img src="//images.weserv.nl/?url=ory.weserv.nl/lichtenstein.jpg&w=300">
// var picsurl= path=> `//images.weserv.nl/?url=http://www.hoogwerpers.be/hoogwerpers/pics/${path}`;
const picsurl = (path: string) =>
  `//images.weserv.nl/?url=http://www.hoogwerpers.be/hoogwerpers/pics/${path}&w=150&h=150&t=letterbox&bg=white`;

// var picsurl= `http://www.hoogwerpers.be/hoogwerpers/pics`;
export const throwerImg = (hwid: number) => picsurl(`werper${hwid}.jpg`);
export const groupImg = (vgid: number) => picsurl(`groep${vgid}.jpg`);
export const countryImg = (co: string) => `https://www.countryflags.io/${co}/flat/64.png`;
