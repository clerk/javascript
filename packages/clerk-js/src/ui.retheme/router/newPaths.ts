export const newPaths = (oldIndexPath: string, oldFullPath: string, path?: string, index?: boolean) => {
  let indexPath = oldIndexPath;
  if (path) {
    indexPath = oldFullPath;
    if (!index) {
      indexPath += '/' + path;
    }
  }
  if (indexPath.startsWith('//')) {
    indexPath = indexPath.substr(1);
  }

  let fullPath = oldFullPath + (path ? '/' + path : '');
  if (fullPath.startsWith('//')) {
    fullPath = fullPath.substr(1);
  }
  return [indexPath, fullPath];
};
