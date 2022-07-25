import { Col, descriptors, Flex, Text } from '../customizables';
import { InternalTheme } from '../foundations';

type PasswordStrengthBarProps = {
  password: string;
  descriptions?: string[];
  colors?: (theme: InternalTheme) => string[];
};

const defaultDescriptions = ['Very weak', 'Weak', 'Good', 'Strong', 'Very strong'];

const defaultColors = (t: InternalTheme) => {
  return [t.colors.$danger300, t.colors.$warning300, t.colors.$success300, t.colors.$success400, t.colors.$success500];
};

export const PasswordStrengthBar = (props: PasswordStrengthBarProps) => {
  const { colors = defaultColors, descriptions = defaultDescriptions, password } = props;
  const score = passwordStrength(password);

  return (
    <Col
      elementDescriptor={descriptors.strengthMeterBox}
      gap={1}
      sx={t => ({ padding: `0 ${t.space.$0x5}` })}
    >
      <Flex
        gap={2}
        justify='between'
        elementDescriptor={descriptors.strengthMeterBarRow}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          return (
            <Flex
              elementDescriptor={descriptors.strengthMeterBar}
              sx={t => ({
                borderRadius: t.radii.$sm,
                height: t.sizes.$1x5,
                flex: '1',
                backgroundColor: i <= score - 1 ? colors(t)[score - 1] : t.colors.$blackAlpha200,
                transition: `background-color ${t.transitionDuration.$slow} ${t.transitionTiming.$common}`,
              })}
            />
          );
        })}
      </Flex>
      <Flex
        elementDescriptor={descriptors.strengthMeterLabelRow}
        justify='end'
      >
        <Text
          elementDescriptor={descriptors.strengthMeterLabel}
          variant='smallRegular'
          colorScheme='neutral'
        >
          {descriptions[score - 1]}
        </Text>
      </Flex>
    </Col>
  );
};

const levels = {
  empty: 0,
  veryWeak: 1,
  weak: 2,
  good: 3,
  strong: 4,
  veryStrong: 5,
};

export const passwordStrength = (password: string) => {
  // if (!password.length) {
  //   return levels.empty;
  // }

  const score = scorePassword(password);
  if (score <= 20) {
    return levels.veryWeak;
  }
  if (score < 35) {
    return levels.weak;
  }
  if (score < 70) {
    return levels.good;
  }
  if (score < 110) {
    return levels.strong;
  }
  return levels.veryStrong;
};

function scorePassword(pass: string) {
  if (!pass) {
    return 0;
  }

  let score = 0;
  const letters = {} as Record<string, number>;
  for (let i = 0; i < pass.length; i++) {
    letters[pass[i]] = (letters[pass[i]] || 0) + 1;
    score += 5.0 / letters[pass[i]];
  }

  const variations = {
    digits: /\d/.test(pass),
    lower: /[a-z]/.test(pass),
    upper: /[A-Z]/.test(pass),
    nonWords: /\W/.test(pass),
  };

  let variationCount = 0;
  Object.values(variations).forEach(val => (variationCount += val ? 1 : 0));
  score += (variationCount - 1) * 10;
  score = pass.length < 8 ? score / 2 : score;
  return Math.floor(score);
}
