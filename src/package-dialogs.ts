// The browser manages focus trapping, Escape and focus restoration for native
// modal dialogs. This controller only routes triggers and manages scroll/dismissal.
export function bindPackageDialogs(
  buttons: Iterable<HTMLElement>,
  dialogs: Iterable<HTMLDialogElement>,
  scrollRoot: HTMLElement,
  onOpen?: (dialog: HTMLDialogElement, trigger: HTMLElement) => void
): () => void {
  const surfaces = [...dialogs];
  const byId = new Map(surfaces.map((dialog) => [dialog.id, dialog]));
  const removers: Array<() => void> = [];
  const syncScrollLock = () => {
    scrollRoot.classList.toggle(
      "package-dialog-open",
      surfaces.some((dialog) => dialog.open)
    );
  };

  for (const button of buttons) {
    const open = (event: MouseEvent) => {
      // Preserve normal new-tab behavior for links to the public Mindbody page.
      if (
        button.tagName === "A" &&
        (event.button ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey)
      )
        return;
      const dialog = byId.get(button.dataset.packageDialog ?? "");
      if (!dialog || dialog.open) return;
      if (button.tagName === "A") event.preventDefault();
      const previous = button.closest?.("dialog") as HTMLDialogElement | null;
      if (previous?.open && previous !== dialog) previous.close();
      dialog.showModal();
      // A sticky close control must not reopen long details at an old scroll position.
      dialog.scrollTop = 0;
      dialog.scrollLeft = 0;
      syncScrollLock();
      onOpen?.(dialog, button);
    };
    button.addEventListener("click", open);
    removers.push(() => button.removeEventListener("click", open));
  }

  for (const dialog of surfaces) {
    let pointerStartedOutside = false;
    const isOutside = (event: MouseEvent) => {
      const bounds = dialog.getBoundingClientRect();
      return (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      );
    };
    const startPointer = (event: MouseEvent) => {
      pointerStartedOutside = event.target === dialog && isOutside(event);
    };
    const dismissBackdrop = (event: MouseEvent) => {
      if (pointerStartedOutside && event.target === dialog && isOutside(event)) {
        dialog.close();
      }
      pointerStartedOutside = false;
    };
    dialog.addEventListener("pointerdown", startPointer);
    dialog.addEventListener("click", dismissBackdrop);
    dialog.addEventListener("close", syncScrollLock);
    removers.push(() => {
      dialog.removeEventListener("pointerdown", startPointer);
      dialog.removeEventListener("click", dismissBackdrop);
      dialog.removeEventListener("close", syncScrollLock);
    });
  }

  syncScrollLock();
  return () => {
    for (const remove of removers) remove();
    for (const dialog of surfaces) {
      if (dialog.open) dialog.close();
    }
    scrollRoot.classList.remove("package-dialog-open");
  };
}
