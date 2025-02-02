import * as colors from 'colors/safe'
import { AutoSidebarPage, BuiltInSortRules, GroupPagesResult, SortOptions } from '../types'

// 获取指定排序页面该插入的下标
const findSpecifiedPageIndex = (defaultPagesGroupByMenuPath: GroupPagesResult, page: AutoSidebarPage) => {
  const pageGroup = defaultPagesGroupByMenuPath[page.menuPath]

  if (!pageGroup) return -1

  const { autoPrev, autoNext } = page.frontmatter

  // 一个 page 不可能同时插入多个地方
  // 所以当 autoPrev, autoNext 同时存在时仅考虑 autoPrev
  if (autoPrev) {
    return pageGroup.findIndex(page => page.filename === autoPrev)
  } else if (autoNext) {
    return pageGroup.findIndex(page => page.filename === autoNext)
  } else {
    return -1
  }
}

// 内置排序规则
const builtInSortRules: BuiltInSortRules = {
  asc: (pageA, pageB) => pageA.filename > pageB.filename ? 1 : -1,
  desc: (pageA, pageB) => pageA.filename > pageB.filename ? -1 : 1,
  created_time_asc: (pageA, pageB) => pageA.createdTime > pageB.createdTime ? 1 : -1,
  created_time_desc: (pageA, pageB) => pageA.createdTime > pageB.createdTime ? -1 : 1
}

// 将 README 提取到最前
export const readmeFirstSort = (pages: AutoSidebarPage[]) => {
  const index = pages.findIndex(page => page.filename.toUpperCase() === 'README')

  if (index !== -1) {
    const README = pages.splice(index, 1)
    pages.unshift(...README)
  }
}

// 根据数值排序（autoSort）
const sortByAutoSort = (pages: AutoSidebarPage[]) => pages.sort((pageA, pageB) => {
  const pageASort = Number(pageA.frontmatter.autoSort) || 0
  const pageBSort = Number(pageB.frontmatter.autoSort) || 0

  return pageBSort - pageASort
})

// 对 defaultPages 的内容进行排序
export const pagesSort = (pagesGroup: GroupPagesResult, sortOptions: SortOptions) =>
  Object.values(pagesGroup)
    .forEach(pages => {
      const { mode, fn } = sortOptions

      // 自定义排序
      if (mode === 'custom') {
        if (!fn) {
          throw Error('未传递自定义排序函数！')
        }

        return pages.sort(fn)
      }

      // 内置排序规则
      if (!mode) {
        pages.sort(builtInSortRules.asc)
      } else {
        // 时间排序基于 git，部分文件未被跟踪时作出提示
        if (sortOptions.mode === 'created_time_asc' || sortOptions.mode === 'created_time_desc') {
          const untracked = pages.filter(page => !page.createdTime)

          untracked.forEach(un => {
            console.log(colors.red(`${un.menuPath}${un.filename} 未被 git 跟踪，无法参与有效排序`))
          })
        }

        pages.sort(builtInSortRules[mode] || builtInSortRules.asc)
      }

      // 判断是否将 README 提前
      if (sortOptions.readmeFirst) {
        readmeFirstSort(pages)
      }

      sortByAutoSort(pages)
      // 强制将 README 提前
      if (sortOptions.readmeFirstForce) {
        readmeFirstSort(pages)
      }
    })

// 将 specifiedSortPages 插入已排序的 defaultPages 中
export const specifiedPagesSort = (defaultPagesGroupByMenuPath: GroupPagesResult, specifiedSortPages: AutoSidebarPage[]) => {
  function insertPage (page: AutoSidebarPage, targetIndex: number) {
    const index = page.frontmatter.autoPrev ? targetIndex + 1 : targetIndex

    defaultPagesGroupByMenuPath[page.menuPath].splice(index, 0, page)
  }

  let sortQueueCache = []

  while (specifiedSortPages.length) {
    let targetIndex: number = -1
    const page = specifiedSortPages.pop()

    if (page) {
      targetIndex = findSpecifiedPageIndex(defaultPagesGroupByMenuPath, page)

      if (targetIndex !== -1) {
        // 当存在时插入并清空 cache
        insertPage(page, targetIndex)
        specifiedSortPages.push(...sortQueueCache)
        sortQueueCache = []
      } else {
        sortQueueCache.push(page)
      }
    }
  }

  if (sortQueueCache.length) {
    console.log(colors.red('\nvuepress plugin auto sidebar(精准排序): '), `\n  [${colors.green(sortQueueCache.map(q => `${q.filename}(${q.frontmatter.title})`).join('、'))}] \t共 ${sortQueueCache.length} 个文件指向了不存在的 prev 或 next，它将不会显示在 sidebar 中`)
  }
}

// 由于 vuepress 的匹配是从上往下
// 为了避免被上级覆盖需要对 sidebar 进行排序
export const pagesGroupSort = (defaultPagesGroupByMenuPath: GroupPagesResult) =>
  Object.keys(defaultPagesGroupByMenuPath)
    .sort((groupA, groupB) => groupA.length > groupB.length ? -1 : 1)
    .reduce((acc: GroupPagesResult, group) => {
      acc[group] = defaultPagesGroupByMenuPath[group]

      return acc
    }, {})
