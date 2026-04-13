export const colors = {
  primary: '#2e7cfd',
  primaryDark: '#226de6',
  blueGrayMd: '#466291',
  blueGrayDark: '#425066',
  grayDark: '#31353c',
  grayDarkest: '#2a2d33',
  textPrimary: '#030c23',
  cyanAccent: '#2dfcf9',
  orangeAccent: '#fc9c2d',
} as const;

export const typography = {
  heading: {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: '56px',
    lineHeight: '66px',
  },
  subheading: {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 400,
    fontSize: '20px',
    lineHeight: '28px',
  },
  subheadingBold: {
    fontFamily: "'Roboto', sans-serif",
    fontWeight: 700,
    fontSize: '20px',
    lineHeight: '28px',
  },
  body: {
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '26px',
  },
  bodyBold: {
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 700,
    fontSize: '16px',
    lineHeight: '26px',
  },
} as const;
