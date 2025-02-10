import Markdown from '@jescalan/ink-markdown';
import { Box, Newline, Text, useInput } from 'ink';
import React, { useReducer } from 'react';

// A listing of items which can be navigated with arrow keys and expanded/contracted
// with space bar. Limits the number visible at a time to prevent rendering issues with
// super long lists
export default function ExpandableList({ items, numberVisible = 10 }) {
  // set up our little state machine
  const [state, dispatch] = useReducer(reducer, items, items => {
    // add focused/expanded state on the set of items
    const all = items.map((i, idx) => {
      i.focused = idx === 0 ? true : false;
      i.expanded = false;
      return i;
    });

    // start idx, end idx
    const visible = [0, numberVisible];

    return { numberVisible, all, visible };
  });

  // this is what lets us respond to keyboard input
  useInput((input, key) => {
    if (key.downArrow) {
      dispatch({ type: 'focus-next-option' });
    }

    if (key.upArrow) {
      dispatch({ type: 'focus-previous-option' });
    }

    if (input === ' ') {
      dispatch({ type: 'toggle-focused-option' });
    }
  });

  // and here's the actual markup we render for each list item!
  return (
    <>
      <Text color='blue'>Navigation Instructions:</Text>
      <Text>
        Navigate through items with ↑ and ↓ arrow keys. Expand the details of any item with space bar. ↓ key on the last
        item goes to the next page, ↑ on the first item goes to the previous page. To exit this interface, use "control
        + c".
      </Text>
      <Newline />

      {state.all.reduce((memo, item, idx) => {
        if (idx < state.visible[0] || idx >= state.visible[1]) {
          return memo;
        }

        const locations = item.instances.map(
          instance => `${instance.file}:${instance.position.line}:${instance.position.column}`,
        );

        const singleBorderStyle = {
          topLeft: ' ',
          top: '─',
          topRight: ' ',
          left: '',
          bottomLeft: ' ',
          bottom: '─',
          bottomRight: ' ',
          right: '',
        };

        const doubleBorderStyle = {
          topLeft: ' ',
          top: '═',
          topRight: ' ',
          left: '',
          bottomLeft: ' ',
          bottom: '═',
          bottomRight: ' ',
          right: '',
        };

        memo.push(
          <Box
            borderStyle={item.focused ? doubleBorderStyle : singleBorderStyle}
            flexDirection='column'
            borderColor={item.focused ? 'blue' : 'white'}
            paddingX={1}
            key={item.title}
          >
            <Markdown>{item.title}</Markdown>
            {locations.length > 1 ? (
              <Text>Found {locations.length} instances, expand for detail</Text>
            ) : (
              <Text>Location: {locations[0]}</Text>
            )}
            {item.expanded && (
              <>
                <Line />

                {locations.length > 1 && (
                  <>
                    <Text>Locations:</Text>
                    {locations.map(loc => (
                      <Text key={loc}>
                        {'  '}- {loc}
                      </Text>
                    ))}
                    <Line />
                  </>
                )}

                {item.warning && (
                  <>
                    <Text color='yellow'>
                      ⚠️ This is a WARNING and will still match even if you corrected the issue or if no correction is
                      necessary. To dismiss warnings, pass the `--noWarnings` flag to the CLI when running.
                    </Text>
                    <Line />
                  </>
                )}

                <Newline />

                {/* This didn't feel like useful information, but keeping it for future reference */}
                {/* <Text color='gray'>changed in {item.sdk} SDK</Text> */}
                <Markdown>{item.content}</Markdown>
                {/* We are not generating the upgrade guide from the slugs this round, so this is commented out */}
                {/* <Newline /> */}
                {/* <Line /> */}
                {/* <Link url={item.link}>
									<Text>Open in migration guide &raquo;</Text>
								</Link> */}
              </>
            )}
          </Box>,
        );
        return memo;
      }, [])}

      {state.all.length > state.numberVisible && (
        <Text>
          Showing {state.visible[0] + 1} - {Math.min(state.visible[1], state.all.length)} of {state.all.length}
        </Text>
      )}
    </>
  );
}

const Line = () => (
  <Box
    borderStyle='single'
    borderRight={false}
    borderLeft={false}
    borderBottom={false}
  />
);

// I'd like to recognize that this logic is kinda crazy, but it works 💖
function reducer(state, action) {
  if (action.type === 'focus-next-option') {
    let nextIdx;

    // if the current item is focused and a next item exists
    // un-focus it and tee up the next one to be focused
    const all = state.all.map((item, idx) => {
      if (item.focused && state.all[idx + 1]) {
        nextIdx = idx + 1;
        item.focused = false;
        return item;
      }

      if (idx === nextIdx) {
        item.focused = true;
        return item;
      }

      return item;
    });

    // if we're scrolling past the last item in the list, shift the visible window
    let visible = state.visible;
    if (nextIdx >= state.visible[1]) {
      visible = [state.visible[0] + state.numberVisible, state.visible[1] + state.numberVisible];
    }

    return { all, visible, numberVisible: state.numberVisible };
  }

  if (action.type === 'focus-previous-option') {
    let nextIdx;

    // if the next item is focused, focus this one and tee up the next one to be un-focused
    const all = state.all.map((item, idx) => {
      if (state.all[idx + 1]?.focused) {
        item.focused = true;
        nextIdx = idx + 1;
        return item;
      }

      if (idx === nextIdx) {
        item.focused = false;
        return item;
      }

      return item;
    });

    // if we're scrolling to before the first item in the list, shift the visible window
    let visible = state.visible;
    if (nextIdx - 1 < state.visible[0]) {
      visible = [state.visible[0] - state.numberVisible, state.visible[1] - state.numberVisible];
    }

    return { all, visible, numberVisible: state.numberVisible };
  }

  // if the space bar is hit, toggle expand/contract on the currently focused item
  if (action.type === 'toggle-focused-option') {
    const all = state.all.map(item => {
      if (item.focused) {
        item.expanded = !item.expanded;
      }
      return item;
    });
    console.log(''); // this is strange but seems to solve a rendering bug
    return { all, visible: state.visible, numberVisible: state.numberVisible };
  }
}
