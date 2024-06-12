'use client';

import { Field, Input, Label } from '@clerk/elements/common';
import { SignIn, Step } from '@clerk/elements/sign-in';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';

export default function Page() {
  return (
    <SignIn path='/otp-playground'>
      <Step name='start'>
        <div className='flex h-dvh flex-col items-center justify-center bg-neutral-800'>
          <Field name='code-one'>
            <Input
              type='otp'
              className='mb-8 text-black'
            />
          </Field>
          <Field name='code'>
            <Label className='sr-only'>Label</Label>
            <Input
              className='isolate flex gap-3 text-2xl font-semibold text-white'
              type='otp'
              render={({ value, status }) => (
                <div
                  className={clsx(
                    'relative flex h-14 w-12 items-center justify-center rounded-md bg-neutral-900 shadow-[0_10px_19px_4px_theme(colors.black/16%),_0_-10px_16px_-4px_theme(colors.white/4%),_0_0_0_1px_theme(colors.white/1%),_0_1px_0_0_theme(colors.white/2%)]',
                    (status === 'cursor' || status === 'selected') &&
                      'border border-sky-400 shadow-[0_0_8px_2px_theme(colors.sky.400/30%)]',
                    status === 'hovered' && 'border border-sky-700 shadow-[0_0_8px_2px_theme(colors.sky.700/30%)]',
                  )}
                >
                  <AnimatePresence>
                    {value && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                        className='absolute inset-0 flex items-center justify-center text-white'
                      >
                        {value}
                      </motion.span>
                    )}
                    {value}
                  </AnimatePresence>

                  {/* {(status === 'cursor' || status === 'selected') && (
                    <motion.div
                      layoutId='tab-trigger-underline'
                      transition={{ duration: 0.2, type: 'spring', damping: 20, stiffness: 200 }}
                      className='absolute inset-0 border border-sky-400 shadow-[0_0_8px_2px_theme(colors.sky.400/30%)] z-10 rounded-[inherit] bg-sky-400/10'
                    />
                  )} */}
                </div>
              )}
            />
          </Field>
        </div>
      </Step>
    </SignIn>
  );
}
