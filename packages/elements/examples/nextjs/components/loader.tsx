'use client';
import { useIsLoading_unstable } from '@clerk/elements/sign-in';
import { motion } from 'framer-motion';

const colors = ['#22238f', '#6b45fa', '#ca3286', '#fe2b49', '#fe652d'];

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const dotVariants = {
  initial: {},
  animate: {
    height: [20, 40, 20],
    transition: {
      repeat: Infinity,
    },
  },
};

const Loader = ({ count = 5 }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial='initial'
      animate='animate'
      style={{
        display: 'flex',
        gap: 10,
        height: 40,
        alignItems: 'center',
      }}
    >
      {Array(count)
        .fill(null)
        .map((_, index) => {
          return (
            <motion.div
              key={index}
              variants={dotVariants}
              style={{
                height: 20,
                width: 20,
                backgroundColor: colors[index % colors.length],
                borderRadius: 20,
              }}
            />
          );
        })}
    </motion.div>
  );
};

export function Loading({ children }: { children: React.ReactNode }) {
  const [isLoading] = useIsLoading_unstable();

  return isLoading ? <Loader /> : children;
}
