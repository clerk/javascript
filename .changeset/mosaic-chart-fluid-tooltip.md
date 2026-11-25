---
'@clerk/mosaic': minor
---

The chart tooltip now slides between bars instead of jumping, and stays put when it first opens. With reduced motion it only fades. While the selected bar is scrolled out of view the tooltip hides, and it comes back when the bar does. Moving the pointer within one bar no longer rerenders the chart.

`Chart.Tooltip` carries two new attributes for styling: `data-moving`, from the first change of bar until it closes, and `data-anchor-hidden`, while the selected bar is out of view.
