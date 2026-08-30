import { useMDXComponents as getDocsMDXComponents } from 'nextra/mdx-components'
import { getEnhancedPageMap } from '@/components/get-page-map'
import { generateDefinition, TSDoc } from 'nextra/tsdoc'
import type { Folder } from 'nextra'
import * as Card from '@/components/card'
import * as CodeGroup from '@/components/code-group'
import * as CodeBlock from '@/components/code-block'
import * as Color from '@/components/color'
import * as Columns from '@/components/columns'
import * as Expandable from '@/components/expandable'
import * as Frame from '@/components/frame'
import * as Icon from '@/components/icon'
import * as Steps from '@/components/steps'
import * as Tile from '@/components/tile'
import * as Tooltip from '@/components/tooltip'
import * as Tree from '@/components/tree'

import type { ComponentProps } from 'react'



type TSDocProps = ComponentProps<typeof TSDoc>
type GenerateDefinitionArgs = Parameters<typeof generateDefinition>[0]

const clean = (mod: any) =>
  Object.fromEntries(
    Object.entries(mod).filter(
      ([key, value]) => key !== "__esModule" && key !== "default" && value !== undefined
    )
  )

interface APIDocsProps
  extends
    Partial<TSDocProps>,
    Pick<GenerateDefinitionArgs, 'code' | 'flattened'> {
  componentName?: string
  groupKeys?: string
  packageName?: string
}

const { img: Image, ...docsComponents } = getDocsMDXComponents({
  figure: props => <figure className="mt-[1.25em]" {...props} />,
  figcaption: props => (
    <figcaption className="mt-2 text-center text-sm" {...props} />
  ),
  async APIDocs({
    componentName,
    groupKeys,
    packageName = 'nextra/components',
    code: $code,
    flattened,
    definition: $definition,
    ...props
  }: APIDocsProps) {
    if (Object.keys(props).length) {
      throw new Error(`Unexpected props: ${Object.keys(props)}`)
    }
    let code: string

    if (componentName) {
      const result = groupKeys
        ? `Omit<MyProps, keyof ${groupKeys}> & { '...props': ${groupKeys} }>`
        : 'MyProps'

      code = `
import type { ComponentProps } from 'react'
import type { ${componentName.split('.')[0]} } from '${packageName}'
type MyProps = ComponentProps<typeof ${componentName}>
type $ = ${result}

export default $`
    } else {
      code = $code as string
    }
    const definition =
      $definition ??
      generateDefinition(
        { code, flattened } as GenerateDefinitionArgs
      )
    const pageMap = await getEnhancedPageMap()
    const apiPageMap = pageMap.find(
      (o): o is Folder => 'name' in o && o.name === 'api'
    )!.children

    return (
      <TSDoc
        definition={definition}
        typeLinkMap={{
          ...Object.fromEntries(
            apiPageMap
              .filter(o => 'route' in o && o.name !== 'index')
                .map((o: any) => [o.title, o.route])
          ),
        }}
      />
    )
  }
})


export const useMDXComponents = (components: any) => ({
  ...docsComponents,
  ...components,
  ...clean(Card), 
  ...clean(CodeGroup),
  ...clean(CodeBlock),
  ...clean(Color),
  ...clean(Columns),
  ...clean(Expandable),
  ...clean(Frame),
  ...clean(Icon),
  ...clean(Steps),
  ...clean(Tile),
  ...clean(Tooltip),
  ...clean(Tree)
})
