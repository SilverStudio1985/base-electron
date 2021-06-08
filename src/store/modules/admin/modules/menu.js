/**
 * 菜单
 * */
import { cloneDeep } from 'lodash';
import { includeArray } from '@/libs/system';

// 根据 menu 配置的权限，过滤菜单
function filterMenu (menuList, access, lastList) {
    menuList.forEach(menu => {
        let menuAccess = menu.auth;

        if (!menuAccess || includeArray(menuAccess, access)) {
            let newMenu = {};
            for (let i in menu) {
                if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
            }
            if (menu.children && menu.children.length) newMenu.children = [];

            lastList.push(newMenu);
            menu.children && filterMenu(menu.children, access, newMenu.children);
        }
    });
    return lastList;
}

export default {
    namespaced: true,
    state: {
        // 顶部菜单
        header: [],
        // 侧栏菜单
        sider: [],
        // 当前顶栏菜单的 name
        headerName: '',
        // 当前所在菜单的 path
        activePath: '',
        // 展开的子菜单 name 集合
        openNames: [],
        // 2.3.0 所有的菜单
        menuSider: [],
        // 2.4.0 菜单徽标
        menuBadge: []
    },
    getters: {
        /**
         * @description 根据 user 里登录用户权限，对侧边菜单进行鉴权过滤
         * */
        filterSider (state, getters, rootState) {
            const userInfo = rootState.admin.user.info;
            // @权限
            const access = userInfo.access;
            if (access && access.length) {
                return filterMenu(state.sider, access, []);
            } else {
                return filterMenu(state.sider, [], []);
            }
        },
        /**
         * @description 根据 user 里登录用户权限，对顶栏菜单进行鉴权过滤
         * */
        filterHeader (state, getters, rootState) {
            const userInfo = rootState.admin.user.info;
            // @权限
            const access = userInfo.access;
            if (access && access.length) {
                return state.header.filter(item => {
                    let state = true;
                    if (item.auth && !includeArray(item.auth, access)) state = false;
                    if (item.children && item.children.length) {
                        item.children = item.children.filter(child => {
                            let state = true;
                            if (child.auth && !includeArray(child.auth, access)) state = false;
                            return state;
                        })
                    }
                    return state;
                });
            } else {
                return state.header.filter(item => {
                    let state = true;
                    if (item.auth && item.auth.length) state = false;
                    if (item.children && item.children.length) {
                        item.children = item.children.filter(child => {
                            let state = true;
                            if (child.auth && child.auth.length) state = false;
                            return state;
                        });
                    }
                    return state;
                });
            }
        },
        /**
         * @description 当前 header 的全部信息
         * */
        currentHeader (state) {
            return state.header.find(item => item.name === state.headerName);
        },
        /**
         * @description 在当前 header 下，是否隐藏 sider（及折叠按钮）
         * */
        hideSider (state, getters) {
            let visible = false;
            if (getters.currentHeader && 'hideSider' in getters.currentHeader) visible = getters.currentHeader.hideSider;
            return visible;
        }
    },
    mutations: {
        /**
         * @description 设置侧边栏菜单
         * @param {Object} state vuex state
         * @param {Array} menu menu
         */
        setSider (state, menu) {
            state.sider = menu;
        },
        /**
         * @description 设置顶栏菜单
         * @param {Object} state vuex state
         * @param {Array} menu menu
         */
        setHeader (state, menu) {
            state.header = menu;
        },
        /**
         * @description 设置当前顶栏菜单 name
         * @param {Object} state vuex state
         * @param {Array} name headerName
         */
        setHeaderName (state, name) {
            state.headerName = name;
        },
        /**
         * @description 设置当前所在菜单的 path，用于侧栏菜单高亮当前项
         * @param {Object} state vuex state
         * @param {Array} path fullPath
         */
        setActivePath (state, path) {
            state.activePath = path;
        },
        /**
         * @description 设置当前所在菜单的全部展开父菜单的 names 集合
         * @param {Object} state vuex state
         * @param {Array} names openNames
         */
        setOpenNames (state, names) {
            state.openNames = names;
        },
        /**
         * @description 2.3.0，设置所有菜单
         * @param {Object} state vuex state
         * @param {Array} menuSider menuSider
         * */
        setMenuSider (state, menuSider) {
            state.menuSider = menuSider;
        },
        /**
         * @description 2.4.0 设置全部的侧边菜单的徽标
         * */
        setAllMenuBadge (state, data) {
            state.menuBadge = data;
        },
        /**
         * @description 2.4.0 新增或修改某个侧边菜单的徽标
         * */
        setMenuBadge (state, { path, badge }) {
            const menuBadge = cloneDeep(state.menuBadge);
            const menuIndex = menuBadge.findIndex(item => item.path === path);
            if (menuIndex >= 0) {
                menuBadge[menuIndex] = badge;
                state.menuBadge = menuBadge;
            } else {
                state.menuBadge.push(badge);
            }
        },
        /**
         * @description 2.4.0 删除某个侧边菜单的徽标
         * */
        removeMenuBadge (state, path) {
            const menuIndex = state.menuBadge.findIndex(item => item.path === path);
            if (menuIndex >= 0) state.menuBadge.splice(menuIndex, 1);
        }
    }
}
