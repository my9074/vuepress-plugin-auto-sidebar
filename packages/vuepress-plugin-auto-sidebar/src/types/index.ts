import { Page, PageFrontmatter } from 'vuepress-types'

export type ArraySortFn<T> = (pageA: T, pageB: T) => number
export type ArrayMapFn<T> = (value: T, index: number, array: T[]) => any[]

export enum VuePressVersion {
  V1 = 'v1',
  V2 = 'v2'
}

interface AutoSidebarPageFrontmatter {
  autoPrev?: string
  autoNext?: string
  autoGroup?: string
  autoIgnore?: boolean
}

export interface AutoSidebarPage extends Partial<Page> {
  relativePath: string
  menuPath: string
  frontmatter: PageFrontmatter & AutoSidebarPageFrontmatter
  date: string
  filename: string
  createdTime: number
}

type SIDEBAR_OPTIONS_SORT =
  | 'asc' // 升序
  | 'desc' // 降序
  | 'custom' // 自定义
  | 'created_time_asc' // 时间升序
  | 'created_time_desc' // 时间降序

type SIDEBAR_OPTIONS_TITLE =
  | 'default'
  | 'lowercase'
  | 'uppercase'
  | 'capitalize'
  | 'camelcase'
  | 'kebabcase'
  | 'titlecase'

interface IgnoreOption {
  menu: string
  regex?: RegExp
}

export type IgnoreOptions = IgnoreOption[]

export interface SortOptions {
  mode?: SIDEBAR_OPTIONS_SORT
  fn?: ArraySortFn<AutoSidebarPage>
  readmeFirst: boolean
  readmeFirstForce?: boolean
  // sortKey: keyof AutoSidebarPage
}

interface TitleMap {
  [key: string]: string
}

export interface TitleOptions {
  mode: SIDEBAR_OPTIONS_TITLE
  map: TitleMap
}

export interface CollapseOptions {
  open?: boolean
  collapseList?: string[]
  uncollapseList?: string[]
}

interface OutputOptions {
  filename: string
}

export interface AutoSidebarPluginOptions {
  version: VuePressVersion
  output: OutputOptions
  sort: SortOptions
  title: TitleOptions
  sidebarDepth: number
  collapse: CollapseOptions
  ignore: IgnoreOptions,
}

export interface GroupPagesResult {
  [key: string]: AutoSidebarPage[]
}

export interface SidebarGroupResult {
  [key: string]: { title: string, collapsable: boolean, sidebarDepth: number, children: string[] }[]
}

interface Navbar {
  text: string,
  link?: string
  items?: Navbar[]
}

export type NavbarResult = Navbar[]

export interface BuiltInSortRules {
  [key: string]: ArraySortFn<AutoSidebarPage>
}

export interface BuiltInTitleRules {
  [key: string]: (str: string) => string
}
