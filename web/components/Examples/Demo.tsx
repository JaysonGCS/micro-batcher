import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styles from './Demo.module.scss';
import { generateTimes } from './Utils';

const DELAY = 0.2;
const TOTAL_DURATION = 9;
const GLOBAL_TIMES = generateTimes(TOTAL_DURATION, DELAY);
const BOX_SCALE = [1, 2];
const FULFIL_BOX_SCALE = [2, 1];
const API_BOX_SCALE = [1, 1.3, 1.3, 1.3, 1];

export const Demo = () => {
  const [resetToggle, setResetToggle] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setResetToggle((prev) => !prev);
    }, TOTAL_DURATION * 1000);
  }, []);

  const payloadBoxes = useMemo(() => {
    return [0, 1, 2, 3, 4].map((index) => (
      <motion.div
        key={`request-container-${index}`}
        className={styles.box}
        animate={{
          scale: BOX_SCALE
        }}
        transition={{
          ease: 'easeInOut',
          times: GLOBAL_TIMES,
          repeat: Infinity,
          repeatDelay: TOTAL_DURATION,
          delay: 1 * index
        }}
      />
    ));
  }, []);

  const fulfilPayloadBoxes = useMemo(() => {
    return [0, 1, 2, 3, 4].map((index) => (
      <motion.div
        key={`fulfil-request-container-${index}`}
        className={styles.fulfilBox}
        animate={{
          opacity: 1,
          scale: FULFIL_BOX_SCALE
        }}
        initial={{ opacity: 0 }}
        transition={{
          ease: 'easeInOut',
          times: GLOBAL_TIMES,
          repeat: Infinity,
          repeatDelay: TOTAL_DURATION,
          delay: 7
        }}
      />
    ));
  }, []);

  const payloadItems = useMemo(() => {
    return [0, 1, 2, 3, 4].map((index) => {
      return (
        <motion.div
          key={`payload-items-${index}`}
          className={styles.payload}
          animate={{
            opacity: [0, 0.5, 1]
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: TOTAL_DURATION,
            times: GLOBAL_TIMES,
            delay: 1 * index
          }}
        />
      );
    });
  }, []);

  return (
    <div className={styles.container}>
      <div key={resetToggle} className={styles.demoContainer}>
        <div className={styles.componentPayloadContainer}>
          <motion.div
            className={styles.fulfilRequestContainer}
            transition={{ delay: 7.2, repeat: Infinity, repeatDelay: TOTAL_DURATION }}>
            {fulfilPayloadBoxes}
          </motion.div>
          <motion.div
            className={styles.requestContainer}
            animate={{ opacity: 0 }}
            transition={{ delay: 7, repeat: Infinity, repeatDelay: TOTAL_DURATION }}>
            {payloadBoxes}
          </motion.div>
        </div>
        <div className={styles.microBatcherContainer}>
          <div className={styles.microBatcherMiddleContainer}>
            <motion.div
              className={styles.microBatcherMiddleContainerProcessing}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7, repeat: Infinity, repeatDelay: TOTAL_DURATION }}>
              <motion.svg viewBox="0 0 60 60">
                <motion.line
                  strokeLinecap={'round'}
                  x1="3"
                  y1="23"
                  x2="45"
                  y2="37"
                  stroke={'blue'}
                />
                <motion.line
                  strokeLinecap={'round'}
                  x1="17"
                  y1="23"
                  x2="45"
                  y2="37"
                  stroke={'blue'}
                />
                <motion.line
                  strokeLinecap={'round'}
                  x1="30"
                  y1="23"
                  x2="45"
                  y2="37"
                  stroke={'blue'}
                />
                <motion.line
                  strokeLinecap={'round'}
                  x1="44"
                  y1="23"
                  x2="45"
                  y2="37"
                  stroke={'blue'}
                />
                <motion.line
                  strokeLinecap={'round'}
                  x1="57"
                  y1="23"
                  x2="45"
                  y2="37"
                  stroke={'blue'}
                />
              </motion.svg>
            </motion.div>
            <motion.div
              animate={{ opacity: 0 }}
              transition={{
                repeat: Infinity,
                repeatDelay: TOTAL_DURATION,
                delay: 7
              }}>
              <motion.div
                className={styles.microBatcherMiddleContainerProcessing}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.2, repeat: Infinity, repeatDelay: TOTAL_DURATION }}>
                <span>Processing payloads</span>
              </motion.div>
            </motion.div>
            <div className={styles.payloadInterceptorContainer}>
              <motion.div
                className={styles.payloadQueue}
                animate={{ opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: TOTAL_DURATION,
                  delay: 5
                }}>
                {payloadItems}
              </motion.div>
              <motion.span
                animate={{ opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatDelay: TOTAL_DURATION,
                  delay: 5
                }}>
                <span>Intercept Payload</span>
              </motion.span>
            </div>
          </div>
          <div className={styles.resolverContainer}>
            <div className={styles.singleResolver}>Single API</div>
            <motion.div
              className={styles.batchResolver}
              animate={{ scale: API_BOX_SCALE, backgroundColor: 'midnightblue' }}
              transition={{
                times: GLOBAL_TIMES,
                repeat: Infinity,
                repeatDelay: TOTAL_DURATION,
                duration: 3,
                delay: 5
              }}>
              <span>Batch API</span>
            </motion.div>
          </div>
          <span style={{ fontWeight: 'bold' }}>Micro Batcher</span>
        </div>
      </div>
    </div>
  );
};
