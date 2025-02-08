import { CommonModule } from "@angular/common";
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-uploadimage',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './uploadimage.component.html',
  styleUrl: './uploadimage.component.css'
})
export class UploadimageComponent implements AfterViewInit, OnDestroy {

  @ViewChild("imageCanvas", { static: false }) imageCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild("videoElement", { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  imageSrc: string | null = null;
  originalImage = new Image();
  cropping = false;
  showCropButton = false;
  showOkButton = false;
  startX = 0;
  startY = 0;
  endX = 0;
  endY = 0;

  stream: MediaStream | null = null;
  cameraActive = false;

  

  ngOnDestroy(): void {
    this.stopCamera();
  }

  ngAfterViewInit() {}

  async initializeCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access the camera. Please check permissions.");
    }
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  capturePhoto(): void {
    const video = this.videoElement.nativeElement;
    const canvas = this.imageCanvas.nativeElement;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageSrc = canvas.toDataURL("image/png");
      this.originalImage.src = this.imageSrc;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.imageSrc = reader.result as string;
        this.originalImage.src = this.imageSrc;
        this.originalImage.onload = () => {
          this.drawImageOnCanvas();
        };
      };
      reader.readAsDataURL(file);
    }
  }

  drawImageOnCanvas() {
    if (!this.imageCanvas) return;
    const canvas = this.imageCanvas.nativeElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = this.originalImage.width;
    canvas.height = this.originalImage.height;
    ctx.drawImage(this.originalImage, 0, 0);
  }

  startCrop(event: MouseEvent) {
    this.cropping = true;
    this.startX = event.offsetX;
    this.startY = event.offsetY;
    this.showCropButton = false;
    this.showOkButton = false;
  }

  endCrop(event: MouseEvent) {
    if (!this.cropping) return;
    this.endX = event.offsetX;
    this.endY = event.offsetY;
    this.cropping = false;
    this.showCropButton = true;
    this.drawCropRectangle();
  }

  drawCropRectangle() {
    if (!this.imageCanvas) return;
    const canvas = this.imageCanvas.nativeElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.originalImage, 0, 0);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.startX, this.startY, this.endX - this.startX, this.endY - this.startY);
  }

  cropImage() {
    if (!this.imageCanvas) return;
    const canvas = this.imageCanvas.nativeElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = this.endX - this.startX;
    const height = this.endY - this.startY;

    if (width <= 0 || height <= 0) {
      alert("Invalid crop area! Please select a valid region.");
      return;
    }

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) return;

    croppedCanvas.width = width;
    croppedCanvas.height = height;
    const imageData = ctx.getImageData(this.startX, this.startY, width, height);
    croppedCtx.putImageData(imageData, 0, 0);

    this.imageSrc = croppedCanvas.toDataURL("image/png");
    this.showOkButton = true;
  }

  confirmCrop() {
    this.showOkButton = false;
    this.showCropButton = false;
  }
}




