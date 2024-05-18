/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/// A wrapper type that allows comparing pointer equality of references. Two
/// `PointerAddress` values are equal if they point to the same memory location.
///
/// This type is _sound_, but misuse can easily lead to logical bugs if the memory
/// of one PointerAddress could have been freed and reused for a subsequent
/// PointerAddress.
#[derive(Hash, Eq, PartialEq, Clone, Copy)]
pub struct PointerAddress(usize);

impl PointerAddress {
    pub fn new<T>(ptr: &T) -> Self {
        Self(ptr as *const T as usize)
    }
}

impl std::fmt::Debug for PointerAddress {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_fmt(format_args!("{:#X}", self.0))
    }
}
